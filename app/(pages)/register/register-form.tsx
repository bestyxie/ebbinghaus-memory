"use client"

import { useActionState } from "react"
import { register } from "@/app/lib/actions"

export default function RegisterForm() {
  const [errorMessage, formAction, isPending] = useActionState(register, undefined)

  return (
    <form action={formAction}>
      <div>
        <div>
          <label htmlFor="email">email</label>
        </div>
        <div>
          <input
            type="email"
            name="email"
            id="email"
            className="border"
            placeholder="enter your email address"
          />
        </div>
      </div>

      <div>
        <div>
          <label htmlFor="name">name (optional)</label>
        </div>
        <div>
          <input
            type="text"
            name="name"
            id="name"
            className="border"
            placeholder="enter your name"
          />
        </div>
      </div>

      <div>
        <div>
          <label htmlFor="password">password</label>
        </div>
        <div>
          <input
            type="password"
            name="password"
            id="password"
            className="border"
            placeholder="enter your password"
          />
        </div>
      </div>

      {/* 注册流程：register === 'true' 会在 authorize 中触发创建用户逻辑 */}
      <input type="hidden" name="register" value="true" />
      {/* 注册成功后也跳转到 dashboard */}
      <input type="hidden" name="redirectTo" value="/dashboard" />

      <div>
        <button disabled={isPending}>注册</button>
      </div>
      <div className="text-red-500">{errorMessage}</div>
    </form>
  )
}


