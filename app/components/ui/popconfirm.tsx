'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PopConfirmProps {
  children: React.ReactElement;
  title: string;
  description?: string;
  onConfirm: () => void | Promise<void>;
  isDestructive?: boolean;
  confirmText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export function PopConfirm({
  children,
  title,
  description,
  onConfirm,
  isDestructive = true,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  disabled = false,
}: PopConfirmProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
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

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Store a reference to the trigger button element
  useEffect(() => {
    if (triggerRef.current && triggerRef.current.children[0]) {
      buttonRef.current = triggerRef.current.children[0] as HTMLButtonElement;
    }
  }, []);

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Trigger button */}
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {React.cloneElement(children, {
          onClick: (e: React.MouseEvent) => {
            if (React.isValidElement(children)) {
              const originalOnClick = (children as any).props.onClick;
              if (originalOnClick) {
                originalOnClick(e);
              }
            }
          },
        })}
      </div>

      {/* Popconfirm popup */}
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute left-1/2 -translate-x-1/2 mt-2 w-64 z-50 bg-white border border-slate-200 rounded-lg shadow-xl"
        >
          {/* Arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-slate-200 rotate-45" />

          <div className="p-4">
            {/* Title with icon */}
            <div className="flex items-start gap-3">
              {isDestructive && (
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-amber-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900">
                  {title}
                </h4>
                {description && (
                  <p className="text-xs text-gray-500 mt-1">{description}</p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-50 ${
                  isDestructive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
