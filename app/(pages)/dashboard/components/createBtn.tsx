"use client"

import { CreateCardModal } from "./create-card-modal";
import { useState } from "react";

interface CreateBtnProps {
  className?: string;
  children?: React.ReactNode;
}

export default function CreateMemoryItemBtn({ className = "", children }: CreateBtnProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button className={className} onClick={() => setIsOpen(true)}>
        {children || "create"}
      </button>
      <CreateCardModal isOpen={isOpen} onClose={handleClose} />
    </>
  )
}