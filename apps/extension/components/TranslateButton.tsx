import React from 'react'

interface TranslateButtonProps {
  buttonPosition: { top: number; left: number }
  onClick: () => void
}

function TranslateButton({ buttonPosition, onClick }: TranslateButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    console.log('[Hunter] TranslateButton clicked!')
    e.stopPropagation()
    onClick()
  }

  return (
    <button
      className="hunter-translate-button"
      style={{ position: 'absolute', top: `${buttonPosition.top}px`, left: `${buttonPosition.left}px` }}
      onClick={handleClick}
      title="Translate"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 8l6 6"></path>
        <path d="M4 14h6"></path>
        <path d="M2 5h12"></path>
        <path d="M7 2h1"></path>
        <path d="M22 22l-5-10-5 10"></path>
        <path d="M14 18h6"></path>
      </svg>
    </button>
  )
}

export default TranslateButton
