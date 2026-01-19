"use client"

import { CreateCardModal } from "./create-card-modal";
import { useState } from "react";

export default function CreateMemoryItemBtn() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button className="cursor" onClick={() => setIsOpen(true)}>create</button>
      <CreateCardModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}