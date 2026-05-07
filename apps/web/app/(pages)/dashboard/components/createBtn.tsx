"use client"

import { CreateCardModal } from "./create-card-modal";
import { useCallback, useState } from "react";

interface CreateBtnProps {
  className?: string;
  children?: React.ReactNode;
}

export default function CreateMemoryItemBtn({ className = "", children }: CreateBtnProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      <button className={className} onClick={() => setIsOpen(true)}>
        {children || "create"}
      </button>
      <CreateCardModal isOpen={isOpen} onClose={handleClose} />
    </>
  )
}