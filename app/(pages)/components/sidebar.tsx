import { auth } from "@/auth";
import { signOut } from "@/auth";
import {
  MindFlowLogo,
  SearchIcon,
  TagIcon,
  PlusIcon,
  LogoutIcon,
} from "../../components/ui/icons";
import { Navigation } from "./navigation";

export default async function Sidebar() {
  const session = await auth();
  const user = session?.user;

  const tags = [
    { id: 1, name: "Programming", count: 42 },
    { id: 2, name: "Language", count: 128 },
    { id: 3, name: "Biology", count: 15 },
    { id: 4, name: "Math", count: 31 },
  ];

  return (
    <aside className="w-[256px] h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-[68px] px-4 flex items-center">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center">
            <MindFlowLogo className="w-[18px] h-[22px] text-blue-500" />
          </div>
          <span className="text-lg font-semibold">MindFlow</span>
        </div>
      </div>

      {/* Search */}
      <div className="h-[46px] px-3 flex items-center">
        <div className="w-full h-[30px] bg-gray-100 rounded-md flex items-center px-2 gap-2">
          <SearchIcon className="w-[18px] h-[22px] text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400">Search</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <Navigation />

        {/* Tags */}
        <div className="px-5 py-4">
          <div className="text-sm font-semibold text-gray-700 mb-4">Tags</div>
          <div>
            {tags.map((tag) => (
              <button
                key={tag.id}
                className="flex items-center w-full h-10 px-3 rounded-md mb-2 text-left hover:bg-gray-50 transition-colors group"
              >
                <TagIcon className="w-[18px] h-[22px] shrink-0 text-gray-400 group-hover:text-gray-600" />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {tag.name}
                </span>
                <span className="ml-auto text-xs font-medium text-gray-400">
                  {tag.count}
                </span>
              </button>
            ))}
            <button className="flex items-center w-full h-10 px-3 rounded-md text-left text-gray-500 hover:bg-gray-50 transition-colors">
              <PlusIcon className="w-[18px] h-[22px] shrink-0 text-gray-400" />
              <span className="ml-2 text-sm font-medium">New Tag</span>
            </button>
          </div>
        </div>
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
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogoutIcon className="w-[18px] h-[22px] text-gray-500" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
