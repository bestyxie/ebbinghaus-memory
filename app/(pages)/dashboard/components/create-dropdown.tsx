"use client"

import { Plus, FileText, ChevronDown } from 'lucide-react';
import { CreateCardModal } from "./create-card-modal";
import { useCallback, useState, useRef, useEffect } from "react";
import Link from "next/link";

interface CreateDropdownProps {
  className?: string;
}

export function CreateDropdown({ className = "" }: CreateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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

  return (
    <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
      <button
        className={`${className} flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-4 w-4" />
        New Point
        <ChevronDown className="h-4 w-4 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 z-50">
          <button
            onClick={() => {
              setIsOpen(false);
              setIsModalOpen(true);
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-5 w-5 text-blue-600" />
            New Point
          </button>

          <Link
            href="/article-editor"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileText className="h-5 w-5 text-blue-600" />
            New Article
          </Link>
        </div>
      )}

      <CreateCardModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
}
