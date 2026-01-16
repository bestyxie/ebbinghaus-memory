import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    /**
     * 控制哪些路由需要登录
     * 这里允许未登录访问 /login，其余页面需要登录
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;

      const publicPaths = ['/login'];
      const isPublic = publicPaths.some((path) =>
        nextUrl.pathname.startsWith(path)
      );

      if (isPublic) return true;

      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;