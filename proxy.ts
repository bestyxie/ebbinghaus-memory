import { auth } from "./app/lib/auth";
// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
// import { auth } from "@/lib/auth"; // 指向你初始化 Better Auth 实例的文件

export async function proxy(request: NextRequest) {
  // 1. 获取当前的 Session
  // 因为运行在 Node.js 环境，这里会直接查库验证 token 的真实性
  // 注意：在 Next.js 最新架构中，headers() 是异步函数，需要 await
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { pathname } = request.nextUrl;

  // 2. 路由保护逻辑
  // 场景 A：未登录用户，试图访问受保护的页面（如 /dashboard）
  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 场景 B：已登录用户，试图访问公开的登录或注册页
  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. 校验通过，继续处理请求
  return NextResponse.next();
}

// 4. 配置需要匹配的路由
// 建议过滤掉静态文件、内部图片资源和 API 路由，避免不必要的性能消耗
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
