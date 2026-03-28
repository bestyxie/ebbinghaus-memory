"use client"

import { Plus, FileText, ChevronDown } from 'lucide-react';
import { CreateCardModal } from "./create-card-modal";
import { useCallback, useState } from "react";
import { Dropdown } from "@/app/components/ui/dropdown";

interface CreateDropdownProps {
  className?: string;
}

export function CreateDropdown({ className = "" }: CreateDropdownProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const trigger = (
    <button
      className={`${className} flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
    >
      <Plus className="h-4 w-4" />
      New Point
      <ChevronDown className="h-4 w-4 ml-1" />
    </button>
  );

  const items = [
    {
      label: "New Point",
      icon: <Plus className="h-5 w-5 text-blue-600" />,
      onClick: () => setIsModalOpen(true),
    },
    {
      label: "New Article",
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      href: "/article-editor",
    },
  ];

  return (
    <>
      <Dropdown trigger={trigger} items={items} className="flex-1 md:flex-none" />
      <CreateCardModal isOpen={isModalOpen} onClose={handleClose} />
    </>
  );
}
