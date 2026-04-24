import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAuth } from '@/app/lib/api-helpers';

export async function GET(request: NextRequest) {
  const userId = await requireAuth(request);
  if (userId instanceof NextResponse) return userId;

  // 1. 从请求中获取需要查询的单词
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');

  if (!word) {
    return NextResponse.json(
      { error: '请提供要查询的单词 (例如: ?word=apple)' },
      { status: 400 }
    );
  }

  // 2. 读取环境变量中的密钥
  const appid = process.env.BAIDU_APP_ID;
  const secret = process.env.BAIDU_SECRET_KEY;

  if (!appid || !secret) {
    return NextResponse.json(
      { error: '服务端缺失 Baidu API 配置' },
      { status: 500 }
    );
  }

  // 3. 计算百度要求的 MD5 签名
  const salt = Date.now().toString();
  const signStr = appid + word + salt + secret;
  const sign = crypto.createHash('md5').update(signStr).digest('hex');

  const baiduParams = new URLSearchParams({
    q: word,
    from: 'en',
    to: 'zh',
    appid: appid,
    salt: salt,
    sign: sign,
  });

  try {
    // --- 2. 并发请求两个 API (极大提升速度) ---
    const [baiduResponse, dictResponse] = await Promise.all([
      // 请求百度 (获取精准的中文释义)
      fetch('https://fanyi-api.baidu.com/api/trans/vip/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: baiduParams,
      }),
      // 请求开源词典 (获取音标、词性、发音音频)
      fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    ]);
    const baiduData = await baiduResponse.json();
    // 如果单词拼写错误或开源词典里没有这个词，它会返回非 200 状态码
    let dictData = null;
    if (dictResponse.ok) {
      const dictRaw = await dictResponse.json();
      dictData = dictRaw[0]; // 获取第一个释义对象
    }

    // --- 3. 提取音标和音频 (从 Free Dictionary API) ---
    let phoneticText = '';
    let audioUrl = '';

    if (dictData && dictData.phonetics) {
      // 找到一个包含纯正文本和音频的项
      const validPhonetic = dictData.phonetics.find((p: { text?: string; audio?: string }) => p.text && p.audio);
      if (validPhonetic) {
        phoneticText = validPhonetic.text;
        audioUrl = validPhonetic.audio;
      } else {
        // 退而求其次，只要有文本就行
        phoneticText = dictData.phonetics[0]?.text || dictData.phonetic || '';
      }
    }
    // --- 4. 组装终极干净的数据返回给前端 ---
    return NextResponse.json(
      {
        word: word,
        basicTranslation: baiduData.trans_result?.[0]?.dst || null,
        phonetic: phoneticText,
        audio: audioUrl,
        englishDefinitions: dictData?.meanings || []
      },
    );
  } catch {
    return NextResponse.json(
      { error: '服务器请求外部 API 失败' },
      { status: 500 }
    );
  }
}