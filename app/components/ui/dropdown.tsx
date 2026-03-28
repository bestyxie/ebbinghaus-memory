"use client"

import { useCallback, useState, useRef, useEffect, ReactNode } from "react";
import Link from "next/link";

export type DropdownItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
};

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export function Dropdown({ trigger, items, align = "right", className = "" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const alignClass = align === "left" ? "left-0" : "right-0";

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div className={`absolute top-full mt-1 ${alignClass} w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50`}>
          {items.map((item, index) => {
            const content = (
              <div className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                {item.icon}
                {item.label}
              </div>
            );

            if (item.href) {
              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={index}
                onClick={() => {
                  setIsOpen(false);
                  item.onClick?.();
                }}
                className="w-full"
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
