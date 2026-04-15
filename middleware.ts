import { NextRequest, NextResponse } from "next/server";

// 允许跨域的 API 路由前缀
const CORS_API_PREFIXES = ["/api/dictionary", "/api/extension"];
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  'Access-Control-Allow-Credentials': 'true',
};

function isCorsApiRoute(pathname: string): boolean {
  return CORS_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('isCorsApiRoute(pathname)', isCorsApiRoute(pathname))
  // 处理需要跨域的 API 路由
  if (isCorsApiRoute(pathname)) {
    // 预检请求直接返回
    if (request.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }
    const response = NextResponse.next();
    for (const [key, val] of Object.entries(CORS_HEADERS)) {
      response.headers.set(key, val);
    }
    return response;
  }

  // 页面路由的认证逻辑
  const publicRoutes = ["/login", "/register"];

  const sessionRes = await fetch(
    new URL("/api/auth/get-session", request.url),
    { headers: request.headers }
  );
  const session = sessionRes.ok ? await sessionRes.json() : null;

  if (!publicRoutes.includes(pathname) && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth).*)",
  ],
};
