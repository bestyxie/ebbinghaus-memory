import { auth } from "./app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  console.log('proxy==============')

  const { pathname } = request.nextUrl;

  // 2. 路由保护逻辑
  const publicRoutes = ["/login", "/register"];

  // 场景 A：未登录用户，试图访问受保护的页面
  if (!publicRoutes.includes(pathname) && !session) {
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
