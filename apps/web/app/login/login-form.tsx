"use client"

import { authenticate, register } from '@/app/lib/auth-actions'
import { useActionState, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Mode = 'login' | 'register'

export default function LoginForm() {
  const [mode, setMode] = useState<Mode>('login')
  const [showPassword, setShowPassword] = useState(false)

  const action = mode === 'login' ? authenticate : register
  const [errorMessage, formAction, isPending] = useActionState<string | undefined, FormData>(action, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* 标题 */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? '登录' : '注册'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login' ? '欢迎回来！请登录您的账户' : '创建新账户开始使用'}
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-6">
          {/* 模式切换 hidden input */}
          <input
            type="hidden"
            name="register"
            value={mode === 'register' ? 'true' : 'false'}
          />
          <input type="hidden" name="redirectTo" value="/dashboard" />

          {/* 表单字段 */}
          <div className="space-y-4">
            {/* 邮箱 */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                placeholder="请输入邮箱地址"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 姓名（仅注册时显示） */}
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  姓名 <span className="text-gray-400">(可选)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  placeholder="请输入您的姓名"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* 密码 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  required
                  minLength={8}
                  maxLength={32}
                  placeholder={mode === 'register' ? '至少8个字符' : '请输入密码'}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {mode === 'register' && (
                <p className="mt-1 text-xs text-gray-500">
                  密码长度：8-32 个字符
                </p>
              )}
            </div>
          </div>

          {/* 错误提示 */}
          {errorMessage && (
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          {/* 提交按钮 */}
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending
                ? '处理中...'
                : mode === 'login'
                  ? '登录'
                  : '注册'
              }
            </button>
          </div>

          {/* 模式切换 */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {mode === 'login' ? '还没有账户？' : '已有账户？'}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setShowPassword(false)
                }}
                className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
              >
                {mode === 'login' ? '立即注册' : '去登录'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
