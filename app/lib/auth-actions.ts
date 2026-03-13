"use server"
import { auth } from "./auth"
import { headers } from "next/headers"
import { redirect } from 'next/navigation'

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await auth.api.signInEmail({
      body: {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
      },
    });

    // 登录成功后重定向到 dashboard
    redirect('/dashboard');
  } catch (error: any) {
    console.error('Error in authenticate:', error)

    // 如果是 redirect 错误，重新抛出
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    return error?.message || "Something went wrong.";
  }
}

export async function register(
  prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  try {
    await auth.api.signUpEmail({
      body: {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        name: formData.get("name") as string,
      },
    });

    // 注册成功后重定向到 dashboard
    redirect('/dashboard');
  } catch (error: any) {
    console.error('Error in register:', error)

    // 如果是 redirect 错误，重新抛出
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }

    return error?.message || "Something went wrong.";
  }
}

export async function signOut() {
  try {
    // const header = await headers()
    await auth.api.signOut();
    redirect('/login');
  } catch (error: any) {
    console.error('Error signing out:', error)

    // 如果是 redirect 错误，重新抛出
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
  }
}
