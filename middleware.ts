import { NextRequest, NextResponse } from 'next/server'
import { authConfig } from './auth.config';
import NextAuth from "next-auth"

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  return NextResponse.next();
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};