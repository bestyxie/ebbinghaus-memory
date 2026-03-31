import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
