/**
 * DOM Highlighting Utilities
 * 
 * Simple utility functions for DOM manipulation during highlighting operations.
 * Separates DOM concerns from reactive state management.
 */

/**
 * Store original styles for later restoration
 */
function storeOriginalStyles(element) {
  element.style.setProperty(
    '--original-background', 
    element.style.background || 'transparent'
  )
  element.style.setProperty(
    '--original-backgroundImage', 
    element.style.backgroundImage || 'none'
  )
}

/**
 * Restore original styles from stored values
 */
function restoreOriginalStyles(element) {
  // Restore original background
  const originalBackground = element.style.getPropertyValue('--original-background')
  const originalBackgroundImage = element.style.getPropertyValue('--original-backgroundImage')

  element.style.background = originalBackground || ''
  element.style.backgroundImage = originalBackgroundImage || ''

  // Clean up isolation
  element.style.isolation = ''

  // Clean up custom properties
  element.style.removeProperty('--original-background')
  element.style.removeProperty('--original-backgroundImage')
}

/**
 * Apply highlight styling to a DOM element
 */
export function applyHighlightToElement(id, relationClass, backgroundStyle) {
  const element = document.getElementById(id)
  if (!element) return false

  // Add border highlight class
  element.classList.add(`${relationClass}-highlight`)

  // Store original styles for restoration
  storeOriginalStyles(element)

  // Apply background styles
  Object.assign(element.style, backgroundStyle)

  // Mark as highlighted for cleanup
  element.setAttribute('data-highlighted-graphs', 'true')

  return true
}

/**
 * Remove highlight styling from a DOM element
 */
export function removeHighlightFromElement(id, relationClass) {
  const element = document.getElementById(id)
  if (!element) return false

  // Remove border highlight class
  element.classList.remove(`${relationClass}-highlight`)

  // Restore original styles if element was graph-highlighted
  if (element.getAttribute('data-highlighted-graphs') === 'true') {
    restoreOriginalStyles(element)
    element.removeAttribute('data-highlighted-graphs')
  }

  return true
}