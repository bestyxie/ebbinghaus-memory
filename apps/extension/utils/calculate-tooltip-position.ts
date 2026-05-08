// Calculate tooltip position to avoid viewport edges

export function calculateTooltipPosition(rect: DOMRect): { top: number; left: number } {
  const TOOLTIP_WIDTH = 300
  const TOOLTIP_HEIGHT = 150
  const MARGIN = 10

  let top = rect.bottom + MARGIN
  let left = rect.left

  // Check if tooltip would go below viewport
  if (top + TOOLTIP_HEIGHT > window.innerHeight) {
    top = rect.top - TOOLTIP_HEIGHT - MARGIN
    // If still doesn't fit, just put it at the top of viewport
    if (top < MARGIN) {
      top = MARGIN
    }
  }

  // Check if tooltip would go right of viewport
  if (left + TOOLTIP_WIDTH > window.innerWidth) {
    left = window.innerWidth - TOOLTIP_WIDTH - MARGIN
  }

  // Ensure minimum margin
  if (left < MARGIN) {
    left = MARGIN
  }

  // Convert viewport coordinates to document coordinates by adding scroll offset
  return {
    top: top + window.scrollY,
    left: left + window.scrollX
  }
}
