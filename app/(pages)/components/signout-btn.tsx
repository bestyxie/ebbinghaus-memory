"use client"
import { signOut } from "@/app/lib/auth-actions";
import { LogOut } from "lucide-react"
import { useActionState } from 'react'

export default function SignOutBtn() {
  // const [state, formAction] = useActionState(signOut, null);

  return (
    <form>
      <button
        type="submit"
        className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
      >
        <LogOut className="w-[18px] h-[22px] text-gray-500" />
      </button>
    </form>
  )
}