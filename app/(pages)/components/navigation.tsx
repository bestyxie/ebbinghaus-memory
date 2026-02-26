"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardCheck,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard", badge: undefined },
    {
      href: "/today-review",
      label: "Today's Review",
      icon: "ClipboardCheck",
      badge: 14,
    },
    { href: "/insights", label: "Insights", icon: "BarChart3", badge: undefined },
    {
      href: "/high-frequency-errors",
      label: "High Frequency Errors",
      icon: "AlertTriangle",
      badge: 8,
    },
  ];

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    ClipboardCheck,
    BarChart3,
    AlertTriangle,
  };

  return (
    <div className="px-2 py-2">
      {navItems.map((item) => {
        const Icon = iconMap[item.icon];
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center h-10 px-3 rounded-md mb-1 transition-colors ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Icon
              className={`w-[18px] h-[22px] shrink-0 ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            />
            <span className="ml-2 text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-xs font-medium text-gray-500">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
