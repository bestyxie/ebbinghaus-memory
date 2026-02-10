import { NextRequest, NextResponse } from 'next/server'
import { authConfig } from './auth.config';
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const start = performance.now();
  const pathname = req.nextUrl.pathname;

  // Log if this is an API route (should NOT happen based on matcher)
  if (pathname.startsWith('/api')) {
    const duration = performance.now() - start;
    console.log(`⚠️  MIDDLEWARE running on API route: ${pathname} (${duration.toFixed(2)}ms)`);
  }

  return NextResponse.next();
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};