import { signOut } from "@/app/lib/auth-actions";
import {
  Brain,
  Search,
  LogOut,
} from "lucide-react";
import { Navigation } from "./navigation";
import { SidebarTagsSection } from "./sidebar-tags-section";
import type { User } from "@/app/lib/auth";

interface SidebarProps {
  user: User | null;
}

export default async function Sidebar({ user }: SidebarProps) {
  return (
    <aside className="w-[256px] h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-[68px] px-4 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center">
            <Brain className="w-[18px] h-[22px] text-blue-500" />
          </div>
          <span className="text-lg font-semibold">MindFlow</span>
        </div>
      </div>

      {/* Search */}
      <div className="h-[46px] px-3 flex items-center">
        <div className="w-full h-[30px] bg-gray-100 rounded-md flex items-center px-2 gap-2">
          <Search className="w-[18px] h-[22px] text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400">Search</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <Navigation />

        {/* Tags Section - Now using client component with real data */}
        <SidebarTagsSection />
      </nav>

      {/* User Profile */}
      <div className="h-[65px] border-t border-gray-200 px-4 flex items-center">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600" />
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {user?.name || user?.email || "User"}
              </div>
              {/* <div className="text-xs text-gray-500">Pro Plan</div> */}
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-[18px] h-[22px] text-gray-500" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
