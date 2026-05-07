import "dotenv/config";
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter});

// 测试数据：英语词汇卡片及对应的输出练习
// 每张卡片设置了不同的 outputRepetitions 来测试不同级别的输出练习
const testCards = [
  // ===== 级别 1: 填空题 (outputRepetitions 0-1) =====
  {
    front: 'ephemeral',
    back: '短暂的，瞬息万变的',
    note: '词根: epi(在...上) + hemera(一天) → 只持续一天的',
    repetitions: 4,
    outputRepetitions: 0,
    outputExercise: {
      targetWord: 'ephemeral',
      englishSentence: 'The beauty of cherry blossoms is ephemeral, lasting only a few days each spring.',
      chineseSentence: '樱花的美丽是短暂的，每年春天只持续几天。',
      fillBlankTemplate: 'The beauty of cherry blossoms is _____, lasting only a few days each spring.',
      wordList: ['The', 'beauty', 'of', 'cherry', 'blossoms', 'is', 'ephemeral', ',', 'lasting', 'only', 'a', 'few', 'days', 'each', 'spring', '.'],
      standardAnswer: 'The beauty of cherry blossoms is ephemeral, lasting only a few days each spring.',
      contextPrompt: '想象你正在向朋友描述樱花季节的短暂美好。请用 ephemeral 这个词来写一个句子。',
    },
  },
  {
    front: 'resilient',
    back: '有弹性的，能迅速恢复的，有适应力的',
    note: '词根: re(向后) + salire(跳) → 跳回来的 → 能恢复的',
    repetitions: 4,
    outputRepetitions: 1,
    outputExercise: {
      targetWord: 'resilient',
      englishSentence: 'Children are remarkably resilient and often bounce back quickly from setbacks.',
      chineseSentence: '孩子的适应力很强，往往能从挫折中迅速恢复过来。',
      fillBlankTemplate: 'Children are remarkably _____ and often bounce back quickly from setbacks.',
      wordList: ['Children', 'are', 'remarkably', 'resilient', 'and', 'often', 'bounce', 'back', 'quickly', 'from', 'setbacks', '.'],
      standardAnswer: 'Children are remarkably resilient and often bounce back quickly from setbacks.',
      contextPrompt: '描述一个人或事物在困难后能够恢复和适应的能力，用 resilient 表达。',
    },
  },
  {
    front: 'inevitable',
    back: '不可避免的，必然发生的',
    note: 'in(不) + evitable(可避免的) → 不可避免的',
    repetitions: 4,
    outputRepetitions: 0,
    outputExercise: {
      targetWord: 'inevitable',
      englishSentence: 'Change is inevitable in life, so we must learn to adapt.',
      chineseSentence: '生活中变化是不可避免的，所以我们必须学会适应。',
      fillBlankTemplate: 'Change is _____ in life, so we must learn to adapt.',
      wordList: ['Change', 'is', 'inevitable', 'in', 'life', ',', 'so', 'we', 'must', 'learn', 'to', 'adapt', '.'],
      standardAnswer: 'Change is inevitable in life, so we must learn to adapt.',
      contextPrompt: '描述一个一定会发生的事情，用 inevitable 表达。',
    },
  },
  {
    front: 'coherent',
    back: '连贯的，条理清楚的，一致的',
    note: 'co(共同) + here(粘) + ent → 粘在一起的 → 连贯的',
    repetitions: 4,
    outputRepetitions: 1,
    outputExercise: {
      targetWord: 'coherent',
      englishSentence: 'Her argument was coherent and easy to follow.',
      chineseSentence: '她的论点连贯，很容易理解。',
      fillBlankTemplate: 'Her argument was _____ and easy to follow.',
      wordList: ['Her', 'argument', 'was', 'coherent', 'and', 'easy', 'to', 'follow', '.'],
      standardAnswer: 'Her argument was coherent and easy to follow.',
      contextPrompt: '描述一个逻辑清晰、有条理的陈述或想法，用 coherent 形容。',
    },
  },

  // ===== 级别 2: 连词成句 (outputRepetitions 2-3) =====
  {
    front: 'serendipity',
    back: '意外发现珍奇事物的运气，机缘巧合',
    note: '源自波斯童话《锡兰三王子》，指意外发现美好事物的能力',
    repetitions: 4,
    outputRepetitions: 2,
    outputExercise: {
      targetWord: 'serendipity',
      englishSentence: 'Finding that rare book in the small bookstore was pure serendipity.',
      chineseSentence: '在那家小书店里找到那本罕见的书纯属机缘巧合。',
      fillBlankTemplate: 'Finding that rare book in the small bookstore was pure _____.',
      wordList: ['Finding', 'that', 'rare', 'book', 'in', 'the', 'small', 'bookstore', 'was', 'pure', 'serendipity', '.'],
      standardAnswer: 'Finding that rare book in the small bookstore was pure serendipity.',
      contextPrompt: '描述一次意外发现好东西的经历，用 serendipity 表达那种惊喜的感觉。',
    },
  },
  {
    front: 'eloquent',
    back: '雄辩的，有说服力的，动人的',
    note: '词根: e(出) + loqui(说话) → 能说会道的',
    repetitions: 4,
    outputRepetitions: 3,
    outputExercise: {
      targetWord: 'eloquent',
      englishSentence: 'Her eloquent speech moved the entire audience to tears.',
      chineseSentence: '她雄辩的演讲让全场观众感动落泪。',
      fillBlankTemplate: 'Her _____ speech moved the entire audience to tears.',
      wordList: ['Her', 'eloquent', 'speech', 'moved', 'the', 'entire', 'audience', 'to', 'tears', '.'],
      standardAnswer: 'Her eloquent speech moved the entire audience to tears.',
      contextPrompt: '描述一个非常有说服力和感染力的演讲或表达方式，用 eloquent 形容。',
    },
  },
  {
    front: 'ambiguous',
    back: '模棱两可的，含糊不清的',
    note: 'ambi(两个) + guous(驱动) → 两个方向都能驱动 → 模棱两可的',
    repetitions: 4,
    outputRepetitions: 2,
    outputExercise: {
      targetWord: 'ambiguous',
      englishSentence: 'The contract contained several ambiguous clauses that led to disputes.',
      chineseSentence: '合同中包含几条模棱两可的条款，导致了争议。',
      fillBlankTemplate: 'The contract contained several _____ clauses that led to disputes.',
      wordList: ['The', 'contract', 'contained', 'several', 'ambiguous', 'clauses', 'that', 'led', 'to', 'disputes', '.'],
      standardAnswer: 'The contract contained several ambiguous clauses that led to disputes.',
      contextPrompt: '描述一个容易引起误解或不清楚的内容，用 ambiguous 表达。',
    },
  },
  {
    front: 'diligent',
    back: '勤奋的，刻苦的，尽职的',
    note: 'di(分开) + lig(选择) + ent → 精心选择的 → 认真的',
    repetitions: 4,
    outputRepetitions: 3,
    outputExercise: {
      targetWord: 'diligent',
      englishSentence: 'The diligent student spent hours studying for the exam every day.',
      chineseSentence: '这个勤奋的学生每天花几个小时备考。',
      fillBlankTemplate: 'The _____ student spent hours studying for the exam every day.',
      wordList: ['The', 'diligent', 'student', 'spent', 'hours', 'studying', 'for', 'the', 'exam', 'every', 'day', '.'],
      standardAnswer: 'The diligent student spent hours studying for the exam every day.',
      contextPrompt: '描述一个工作或学习非常努力的人，用 diligent 表达。',
    },
  },

  // ===== 级别 3: 自由翻译 (outputRepetitions 4-5) =====
  {
    front: 'ubiquitous',
    back: '无处不在的，普遍存在的',
    note: '词根: ubique(到处) + ous(形容词后缀)',
    repetitions: 4,
    outputRepetitions: 4,
    outputExercise: {
      targetWord: 'ubiquitous',
      englishSentence: 'Smartphones have become ubiquitous in modern society, with people carrying them everywhere.',
      chineseSentence: '智能手机在现代社会已经无处不在，人们随身携带。',
      fillBlankTemplate: 'Smartphones have become _____ in modern society, with people carrying them everywhere.',
      wordList: ['Smartphones', 'have', 'become', 'ubiquitous', 'in', 'modern', 'society', ',', 'with', 'people', 'carrying', 'them', 'everywhere', '.'],
      standardAnswer: 'Smartphones have become ubiquitous in modern society, with people carrying them everywhere.',
      contextPrompt: '描述一种在现代生活中随处可见的东西，用 ubiquitous 表达它的普遍性。',
    },
  },
  {
    front: 'pragmatic',
    back: '务实的，实用的，注重实际的',
    note: '源自希腊语 pragmatikos(能做事的) → 实际行动的',
    repetitions: 4,
    outputRepetitions: 5,
    outputExercise: {
      targetWord: 'pragmatic',
      englishSentence: 'The company took a pragmatic approach to solving the budget crisis.',
      chineseSentence: '公司采取了务实的做法来解决预算危机。',
      fillBlankTemplate: 'The company took a _____ approach to solving the budget crisis.',
      wordList: ['The', 'company', 'took', 'a', 'pragmatic', 'approach', 'to', 'solving', 'the', 'budget', 'crisis', '.'],
      standardAnswer: 'The company took a pragmatic approach to solving the budget crisis.',
      contextPrompt: '描述一个注重实际效果而非理论的解决方案，用 pragmatic 表达。',
    },
  },
  {
    front: 'proficient',
    back: '精通的，熟练的',
    note: 'pro(向前) + fic(做) + ient → 能做好的 → 熟练的',
    repetitions: 4,
    outputRepetitions: 4,
    outputExercise: {
      targetWord: 'proficient',
      englishSentence: 'She became proficient in playing the piano after years of practice.',
      chineseSentence: '经过多年的练习，她精通钢琴演奏。',
      fillBlankTemplate: 'She became _____ in playing the piano after years of practice.',
      wordList: ['She', 'became', 'proficient', 'in', 'playing', 'the', 'piano', 'after', 'years', 'of', 'practice', '.'],
      standardAnswer: 'She became proficient in playing the piano after years of practice.',
      contextPrompt: '描述一个人在某个技能上达到了很高的水平，用 proficient 表达。',
    },
  },
  {
    front: 'comprehensive',
    back: '全面的，综合的，详尽的',
    note: 'com(共同) + prehen(抓住) + sive → 全部抓住的 → 全面的',
    repetitions: 4,
    outputRepetitions: 5,
    outputExercise: {
      targetWord: 'comprehensive',
      englishSentence: 'The report provides a comprehensive analysis of the market trends.',
      chineseSentence: '这份报告对市场趋势进行了全面分析。',
      fillBlankTemplate: 'The report provides a _____ analysis of the market trends.',
      wordList: ['The', 'report', 'provides', 'a', 'comprehensive', 'analysis', 'of', 'the', 'market', 'trends', '.'],
      standardAnswer: 'The report provides a comprehensive analysis of the market trends.',
      contextPrompt: '描述一个涵盖所有方面的报告或计划，用 comprehensive 表达。',
    },
  },

  // ===== 级别 4: 情景造句 (outputRepetitions 6+) =====
  {
    front: 'meticulous',
    back: '一丝不苟的，仔细的，精确的',
    note: '源自拉丁语 meticulosus(害怕的) → 因为害怕出错而非常小心',
    repetitions: 4,
    outputRepetitions: 6,
    outputExercise: {
      targetWord: 'meticulous',
      englishSentence: 'The meticulous researcher checked every detail of the experiment three times.',
      chineseSentence: '这位一丝不苟的研究员把实验的每一个细节都检查了三遍。',
      fillBlankTemplate: 'The _____ researcher checked every detail of the experiment three times.',
      wordList: ['The', 'meticulous', 'researcher', 'checked', 'every', 'detail', 'of', 'the', 'experiment', 'three', 'times', '.'],
      standardAnswer: 'The meticulous researcher checked every detail of the experiment three times.',
      contextPrompt: '描述一个对工作非常认真、注重细节的人，用 meticulous 来形容。',
    },
  },
  {
    front: 'exemplify',
    back: '举例说明，作为...的例证',
    note: 'ex(出) + exemplum(例子) + fy(使) → 举出例子',
    repetitions: 4,
    outputRepetitions: 7,
    outputExercise: {
      targetWord: 'exemplify',
      englishSentence: 'This building exemplifies the architectural style of the early 20th century.',
      chineseSentence: '这座建筑是20世纪早期建筑风格的典型代表。',
      fillBlankTemplate: 'This building _____ the architectural style of the early 20th century.',
      wordList: ['This', 'building', 'exemplifies', 'the', 'architectural', 'style', 'of', 'the', 'early', '20th', 'century', '.'],
      standardAnswer: 'This building exemplifies the architectural style of the early 20th century.',
      contextPrompt: '描述一个能很好地代表某种风格或特点的事物，用 exemplify 表达。',
    },
  },
  {
    front: 'nuance',
    back: '细微差别，微妙之处',
    note: '源自法语 nuer(着色) → 颜色的细微变化 → 微妙之处',
    repetitions: 4,
    outputRepetitions: 6,
    outputExercise: {
      targetWord: 'nuance',
      englishSentence: 'The diplomat understood the nuances of international relations.',
      chineseSentence: '这位外交官理解国际关系中的微妙之处。',
      fillBlankTemplate: 'The diplomat understood the _____ of international relations.',
      wordList: ['The', 'diplomat', 'understood', 'the', 'nuances', 'of', 'international', 'relations', '.'],
      standardAnswer: 'The diplomat understood the nuances of international relations.',
      contextPrompt: '描述理解某事物中那些不易察觉的细微差别，用 nuance 表达。',
    },
  },
  {
    front: 'perseverance',
    back: '毅力，坚持不懈',
    note: 'per(通过) + sever(严重) + ance → 在严重困难中坚持 → 毅力',
    repetitions: 4,
    outputRepetitions: 7,
    outputExercise: {
      targetWord: 'perseverance',
      englishSentence: 'His perseverance finally paid off when he passed the exam on his fifth attempt.',
      chineseSentence: '他在第五次尝试时终于通过了考试，他的毅力得到了回报。',
      fillBlankTemplate: 'His _____ finally paid off when he passed the exam on his fifth attempt.',
      wordList: ['His', 'perseverance', 'finally', 'paid', 'off', 'when', 'he', 'passed', 'the', 'exam', 'on', 'his', 'fifth', 'attempt', '.'],
      standardAnswer: 'His perseverance finally paid off when he passed the exam on his fifth attempt.',
      contextPrompt: '描述一个人面对困难不放弃、持续努力的精神，用 perseverance 表达。',
    },
  },
  {
    front: 'synthesis',
    back: '综合，合成，结合',
    note: 'syn(共同) + thesis(放置) → 放在一起 → 综合',
    repetitions: 4,
    outputRepetitions: 8,
    outputExercise: {
      targetWord: 'synthesis',
      englishSentence: 'The book is a brilliant synthesis of Eastern and Western philosophical traditions.',
      chineseSentence: '这本书是东西方哲学传统巧妙结合的产物。',
      fillBlankTemplate: 'The book is a brilliant _____ of Eastern and Western philosophical traditions.',
      wordList: ['The', 'book', 'is', 'a', 'brilliant', 'synthesis', 'of', 'Eastern', 'and', 'Western', 'philosophical', 'traditions', '.'],
      standardAnswer: 'The book is a brilliant synthesis of Eastern and Western philosophical traditions.',
      contextPrompt: '描述将不同元素、思想或方法结合成一个新的整体，用 synthesis 表达。',
    },
  },
  {
    front: 'deteriorate',
    back: '恶化，变坏，退化',
    note: 'de(向下) + terior(更坏的) + ate → 变得更坏 → 恶化',
    repetitions: 4,
    outputRepetitions: 9,
    outputExercise: {
      targetWord: 'deteriorate',
      englishSentence: 'Without proper maintenance, the building\'s condition began to deteriorate rapidly.',
      chineseSentence: '没有适当的维护，建筑物的状况开始迅速恶化。',
      fillBlankTemplate: 'Without proper maintenance, the building\'s condition began to _____ rapidly.',
      wordList: ['Without', 'proper', 'maintenance', ',', 'the', 'building', "'s", 'condition', 'began', 'to', 'deteriorate', 'rapidly', '.'],
      standardAnswer: "Without proper maintenance, the building's condition began to deteriorate rapidly.",
      contextPrompt: '描述某事物的状况变得越来越差，用 deteriorate 表达恶化的过程。',
    },
  },
];

async function main() {
  console.log('开始创建测试数据...');

  // 获取或创建测试用户
  let user = await prisma.user.findUnique({
    where: { email: 'test@test.com' },
  });

  if (!user) {
    console.log('测试用户不存在，请先注册 test@test.com 账户');
    return;
  }

  console.log(`使用测试用户: ${user.email} (ID: ${user.id})`);

  // 创建测试卡组
  const deck = await prisma.deck.upsert({
    where: {
      userId_title: {
        userId: user.id,
        title: 'Output Exercise 测试卡组',
      },
    },
    update: {},
    create: {
      userId: user.id,
      title: 'Output Exercise 测试卡组',
      description: '用于测试输出练习功能的词汇卡组',
      color: '#137fec',
      isPublic: false,
    },
  });

  console.log(`卡组: ${deck.title} (ID: ${deck.id})`);

  // 清理旧的测试数据
  const existingCards = await prisma.card.findMany({
    where: {
      userId: user.id,
      front: { in: testCards.map((c) => c.front) },
    },
  });

  if (existingCards.length > 0) {
    console.log(`清理 ${existingCards.length} 条旧测试数据...`);
    await prisma.card.deleteMany({
      where: {
        id: { in: existingCards.map((c) => c.id) },
      },
    });
  }

  // 统计各级别数量
  const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

  // 创建卡片和输出练习
  for (const cardData of testCards) {
    const card = await prisma.card.create({
      data: {
        userId: user.id,
        cardType: 'FLASHCARD',
        front: cardData.front,
        back: cardData.back,
        note: cardData.note,
        nextReviewAt: new Date(),
        interval: 1,
        easeFactor: 2.5,
        repetitions: cardData.repetitions,
        outputRepetitions: cardData.outputRepetitions,
        state: 'REVIEW',
      },
    });

    await prisma.cardDeck.create({
      data: {
        cardId: card.id,
        deckId: deck.id,
      },
    });

    await prisma.outputExercise.create({
      data: {
        cardId: card.id,
        targetWord: cardData.outputExercise.targetWord,
        englishSentence: cardData.outputExercise.englishSentence,
        chineseSentence: cardData.outputExercise.chineseSentence,
        fillBlankTemplate: cardData.outputExercise.fillBlankTemplate,
        wordList: cardData.outputExercise.wordList,
        standardAnswer: cardData.outputExercise.standardAnswer,
        contextPrompt: cardData.outputExercise.contextPrompt,
      },
    });

    const level = getOutputLevel(cardData.repetitions, cardData.outputRepetitions);
    if (level) {
      levelCounts[level as keyof typeof levelCounts]++;
    }

    const levelLabels: Record<number, string> = {
      1: '填空',
      2: '连词',
      3: '翻译',
      4: '造句',
    };
    const levelLabel = levelLabels[level || 1];

    console.log(`✓ ${cardData.front.padEnd(15)} L${level} [${levelLabel}] (outRep=${cardData.outputRepetitions})`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('测试数据创建完成！');
  console.log(`共创建 ${testCards.length} 张卡片\n`);
  console.log('级别分布:');
  console.log(`  级别 1 (填空题): ${levelCounts[1]} 张`);
  console.log(`  级别 2 (连词成句): ${levelCounts[2]} 张`);
  console.log(`  级别 3 (自由翻译): ${levelCounts[3]} 张`);
  console.log(`  级别 4 (情景造句): ${levelCounts[4]} 张`);
  console.log('='.repeat(60));
}

function getOutputLevel(repetitions: number, outputRepetitions: number): number | null {
  if (repetitions <= 1) return null;
  if (repetitions <= 3) return 1;
  if (outputRepetitions <= 1) return 1;
  if (outputRepetitions <= 3) return 2;
  if (outputRepetitions <= 5) return 3;
  return 4;
}

main()
  .catch((e) => {
    console.error('错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
