import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { ZodError } from 'zod'
import { signSchema } from '@/app/lib/zod'
import { getUserFromDb, createUserForDb } from "@/app/lib/db";
import { saltAndHashPassword, verifyPassword } from '@/app/lib/password'
import { authConfig } from './auth.config';
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "",
        },
        name: {
          type: "text",
          label: "Name",
          placeholder: "",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "",
        },
        register: {
          type: "boolean",
        }
      },
      authorize: async (credentials) => {
        try {
          let user = null;
          const { data, error, success } = await signSchema.safeParseAsync(credentials)
          if (!success) {
            // Zod 验证失败，返回具体的错误信息
            const firstError = error.message
            throw new Error(firstError || '输入数据格式错误')
          }
          const { email, password, register, name } = data

          // 注册流程：register === 'true'
          if (register === 'true') {
            // 检查是否已有用户
            user = await getUserFromDb(email)
            if (user) {
              throw new Error('该邮箱已被注册')
            }
            const hash = await saltAndHashPassword(password)
            user = await createUserForDb(email, hash, name)
            // 返回 NextAuth 需要的用户对象格式
            return {
              id: user.id,
              email: user.email,
              name: user.name || undefined,
            }
          }

          // 登录流程
          user = await getUserFromDb(email)
          if (!user) {
            throw new Error('邮箱或密码错误')
          }

          const isValid = await verifyPassword(password, user.password)
          if (!isValid) {
            throw new Error('邮箱或密码错误')
          }

          // 返回 NextAuth 需要的用户对象格式（不包含密码）
          return {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
          }
        } catch (e) {
          console.log('authorize error:', e)
          if (e instanceof ZodError) {
            throw new Error('输入数据格式错误')
          }
          // 抛出错误让上层处理
          throw e;
        }
      },
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  }
})