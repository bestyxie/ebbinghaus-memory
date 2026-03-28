"use client"

import { Play, BookOpen, FileText, ChevronDown } from 'lucide-react';
import { Dropdown } from "@/app/components/ui/dropdown";

interface ReviewDropdownProps {
  className?: string;
}

export function ReviewDropdown({ className = "" }: ReviewDropdownProps) {
  const trigger = (
    <button
      className={`${className} flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-blue-600/20 hover:brightness-110 transition-all`}
    >
      <Play className="h-4 w-4" />
      Start Reviewing
      <ChevronDown className="h-4 w-4 ml-1" />
    </button>
  );

  const items = [
    {
      label: "Review All",
      icon: <Play className="h-5 w-5 text-blue-600" />,
      href: "/review",
    },
    {
      label: "Flashcards Only",
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      href: "/review?type=flashcard",
    },
    {
      label: "Articles Only",
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      href: "/review?type=article",
    },
  ];

  return <Dropdown trigger={trigger} items={items} className="flex-1 md:flex-none" />;
}
