"use server"
import { signIn } from '@/auth'
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      console.error('AuthError in authenticate:', error.type, error.cause)
      switch (error.type) {
        case 'CredentialsSignin':
          // 获取 cause 中的错误消息
          console.log('error.cause:', error.cause)
          const errorMessage = error.cause?.message || 'Invalid credentials.'
          return errorMessage
        // 兜底：多数回调/验证错误也提示为凭证错误，避免总是 "Something went wrong"
        case 'CallbackRouteError':
          const callbackMessage = error.cause?.message || 'Invalid credentials.'
          return callbackMessage
        default:
          return 'Something went wrong.'
      }
    }
    throw error;
  }
}

export async function register(
  prevState: string|undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          // 获取 cause 中的错误消息
          const errorMessage = (error.cause as any)?.message || 'Invalid credentials.'
          return errorMessage
        case 'CallbackRouteError':
          const callbackMessage = (error.cause as any)?.message || 'Invalid credentials.'
          return callbackMessage
        default:
          return 'Something went wrong.'
      }
    }
    throw error;
  }
}
