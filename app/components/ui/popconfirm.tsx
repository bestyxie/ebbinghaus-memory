'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PopConfirmProps {
  // eslint-disable-next-line
  children: React.ReactElement<any>;
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
  const [popupPosition, setPopupPosition] = useState<React.CSSProperties>({});
  const [arrowPosition, setArrowPosition] = useState<React.CSSProperties>({});
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Function to find the scroll container of an element
  const findScrollContainer = (element: HTMLElement | null): HTMLElement | null => {
    if (!element) return null;

    let current: HTMLElement | null = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      const isScrollable =
        (overflowY === 'auto' || overflowY === 'scroll') ||
        (overflowX === 'auto' || overflowX === 'scroll');

      if (isScrollable && current.scrollHeight > current.clientHeight) {
        return current;
      }
      current = current.parentElement;
    }
    return null;
  };

  // Function to calculate popup position
  const calculatePosition = () => {
    if (popupRef.current && triggerRef.current) {
      const popupRect = popupRef.current.getBoundingClientRect();
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate positions
      const triggerCenter = triggerRect.left + triggerRect.width / 2;
      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      // Determine vertical position (prefer below, fall back to above if needed)
      const showAbove = spaceBelow < popupRect.height + 8 && spaceAbove >= popupRect.height + 8;
      const top = showAbove ? triggerRect.top - popupRect.height - 8 : triggerRect.bottom + 8;

      // Determine horizontal position (center by default, adjust if near edges)
      let left = triggerCenter - popupRect.width / 2;

      // Adjust if too close to left edge
      if (left < 8) {
        left = 8;
      }

      // Adjust if too close to right edge
      if (left + popupRect.width > viewportWidth - 8) {
        left = viewportWidth - popupRect.width - 8;
      }

      // Calculate arrow position
      // Arrow is 16px (w-4 h-4), rotated 45 degrees creates a diagonal triangle
      const arrowOffset = triggerCenter - left;
      const arrowHalfSize = 8; // w-4 h-4 = 16px, half is 8px
      const arrowTop = showAbove ? 'auto' : `-${arrowHalfSize}px`;
      const arrowBottom = showAbove ? `-${arrowHalfSize}px` : 'auto';
      const arrowLeft = `${Math.max(arrowHalfSize, Math.min(popupRect.width - arrowHalfSize, arrowOffset))}px`;

      setPopupPosition({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
      });

      setArrowPosition({
        top: arrowTop,
        bottom: arrowBottom,
        left: arrowLeft,
        transform: showAbove ? 'translateX(-50%) rotate(225deg)' : 'translateX(-50%) rotate(45deg)',
      });
    }
  };

  // Close popup when clicking outside and handle positioning
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

    const handleScroll = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    const handleResize = () => {
      if (isOpen) {
        calculatePosition();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', handleResize);

      // Find and listen to scroll container
      if (triggerRef.current) {
        const scrollContainer = findScrollContainer(triggerRef.current);
        scrollContainerRef.current = scrollContainer;
        if (scrollContainer) {
          scrollContainer.addEventListener('scroll', handleScroll);
        }
      }

      // Calculate initial position
      calculatePosition();
    } else {
      setPopupPosition({});
      setArrowPosition({});
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener('scroll', handleScroll);
        scrollContainerRef.current = null;
      }
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
          ...(children.props || {}),
          onClick: (e: React.MouseEvent) => {
            const childProps = children.props;
            if (typeof childProps.onClick === 'function') {
              childProps.onClick(e);
            }
          },
        })}
      </div>

      {/* Popconfirm popup - rendered via Portal to avoid layout shifts */}
      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            style={popupPosition}
            className="w-64 z-[9999] bg-white border border-slate-200 rounded-lg shadow-xl"
          >
            {/* Arrow - positioned dynamically */}
            <div
              style={arrowPosition}
              className="absolute w-4 h-4 bg-white border-l border-t border-slate-200"
            />

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
                  className={`px-3 py-1.5 text-sm rounded transition-colors disabled:opacity-50 ${isDestructive
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                  {isLoading ? 'Processing...' : confirmText}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
