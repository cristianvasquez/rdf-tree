/**
 * DOM Highlighting Service
 * 
 * Handles all DOM manipulation for entity highlighting operations.
 * Separates DOM concerns from reactive state management for better testing and maintainability.
 */
export class DOMHighlightingService {
  constructor(elementRegistry = document) {
    this.elementRegistry = elementRegistry
  }

  /**
   * Apply highlight styling to a DOM element
   */
  applyHighlightToElement(id, relationClass, backgroundStyle) {
    const element = this.elementRegistry.getElementById(id)
    if (!element) return false

    // Add border highlight class
    element.classList.add(`${relationClass}-highlight`)

    // Store original styles for restoration
    this.storeOriginalStyles(element)

    // Apply background styles
    Object.assign(element.style, backgroundStyle)

    // Mark as highlighted for cleanup
    element.setAttribute('data-highlighted-graphs', 'true')

    return true
  }

  /**
   * Remove highlight styling from a DOM element
   */
  removeHighlightFromElement(id, relationClass) {
    const element = this.elementRegistry.getElementById(id)
    if (!element) return false

    // Remove border highlight class
    element.classList.remove(`${relationClass}-highlight`)

    // Restore original styles if element was graph-highlighted
    if (element.getAttribute('data-highlighted-graphs') === 'true') {
      this.restoreOriginalStyles(element)
      element.removeAttribute('data-highlighted-graphs')
    }

    return true
  }

  /**
   * Store original styles for later restoration
   */
  storeOriginalStyles(element) {
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
  restoreOriginalStyles(element) {
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
   * Check if element exists in DOM
   */
  elementExists(id) {
    return !!this.elementRegistry.getElementById(id)
  }

  /**
   * Batch apply highlights to multiple elements
   */
  batchApplyHighlights(highlightOperations) {
    const results = []
    
    for (const { id, relationClass, backgroundStyle } of highlightOperations) {
      const success = this.applyHighlightToElement(id, relationClass, backgroundStyle)
      results.push({ id, success })
    }
    
    return results
  }

  /**
   * Batch remove highlights from multiple elements
   */
  batchRemoveHighlights(removeOperations) {
    const results = []
    
    for (const { id, relationClass } of removeOperations) {
      const success = this.removeHighlightFromElement(id, relationClass)
      results.push({ id, success })
    }
    
    return results
  }
}