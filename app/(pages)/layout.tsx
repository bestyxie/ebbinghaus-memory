import Sidebar from "./components/sidebar";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";

export default async function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={session?.user || null} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
