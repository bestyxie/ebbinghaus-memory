"use server"
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { auth } from "./auth"
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
  } catch (error) {
    console.error('Error in authenticate:', error)
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof Error) {
      return error?.message || "Something went wrong.";
    }
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
  } catch (error) {
    console.error('Error in register:', error)
    // 如果是 redirect 错误，重新抛出
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof Error) {
      return error?.message || "Something went wrong.";
    } else {
      console.log("捕获到了非标准错误:", error);
    }
  }
}

export async function signOut() {
  try {
    // const header = await headers()
    await auth.api.signOut();
    redirect('/login');
  } catch (error) {
    console.error('Error signing out:', error)

    // 如果是 redirect 错误，重新抛出
    if (isRedirectError(error)) {
      throw error;
    }
  }
}
