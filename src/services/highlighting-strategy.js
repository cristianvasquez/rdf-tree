/**
 * Highlighting Strategy Interface
 * 
 * Defines the contract for different highlighting implementations.
 * Enables switching between DOM-based, CSS-only, or other highlighting approaches.
 */

/**
 * Base highlighting strategy interface
 */
export class HighlightingStrategy {
  /**
   * Apply highlight to entities
   * @param {string[]} entityIds - Array of entity IDs to highlight
   * @param {string} highlightType - Type of highlight (incoming, outgoing, same)
   * @param {Object} options - Highlighting options (backgroundStyle, etc.)
   */
  highlight(entityIds, highlightType, options = {}) {
    throw new Error('highlight method must be implemented')
  }

  /**
   * Remove highlight from entities
   * @param {string[]} entityIds - Array of entity IDs to remove highlight from
   * @param {string} highlightType - Type of highlight to remove
   */
  removeHighlight(entityIds, highlightType) {
    throw new Error('removeHighlight method must be implemented')
  }

  /**
   * Clear all highlights
   */
  clearAll() {
    throw new Error('clearAll method must be implemented')
  }

  /**
   * Check if strategy is available/supported
   */
  isSupported() {
    return true
  }
}

/**
 * DOM-based highlighting strategy (current implementation)
 */
export class DOMHighlightingStrategy extends HighlightingStrategy {
  constructor(domService) {
    super()
    this.domService = domService
  }

  highlight(entityIds, highlightType, options = {}) {
    const { backgroundStyle = {} } = options
    
    entityIds.forEach(id => {
      this.domService.applyHighlightToElement(id, highlightType, backgroundStyle)
    })
  }

  removeHighlight(entityIds, highlightType) {
    entityIds.forEach(id => {
      this.domService.removeHighlightFromElement(id, highlightType)
    })
  }

  clearAll() {
    // Note: This would require tracking all highlighted elements
    // For now, this is handled by the composable's state management
    console.warn('clearAll not implemented for DOMHighlightingStrategy')
  }

  isSupported() {
    return typeof document !== 'undefined'
  }
}

/**
 * CSS-only highlighting strategy (future implementation)
 * Uses only CSS classes without direct style manipulation
 */
export class CSSOnlyHighlightingStrategy extends HighlightingStrategy {
  constructor() {
    super()
    this.highlightedElements = new Set()
  }

  highlight(entityIds, highlightType, options = {}) {
    entityIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        element.classList.add(`${highlightType}-highlight`)
        this.highlightedElements.add({ id, type: highlightType })
      }
    })
  }

  removeHighlight(entityIds, highlightType) {
    entityIds.forEach(id => {
      const element = document.getElementById(id)
      if (element) {
        element.classList.remove(`${highlightType}-highlight`)
        this.highlightedElements.delete({ id, type: highlightType })
      }
    })
  }

  clearAll() {
    this.highlightedElements.forEach(({ id, type }) => {
      const element = document.getElementById(id)
      if (element) {
        element.classList.remove(`${type}-highlight`)
      }
    })
    this.highlightedElements.clear()
  }

  isSupported() {
    return typeof document !== 'undefined'
  }
}

/**
 * Strategy factory for creating appropriate highlighting strategy
 */
export class HighlightingStrategyFactory {
  static create(type = 'dom', dependencies = {}) {
    switch (type) {
      case 'dom':
        return new DOMHighlightingStrategy(dependencies.domService)
      case 'css':
        return new CSSOnlyHighlightingStrategy()
      default:
        throw new Error(`Unknown highlighting strategy: ${type}`)
    }
  }

  static getAvailableStrategies() {
    const strategies = ['css']
    
    if (typeof document !== 'undefined') {
      strategies.push('dom')
    }
    
    return strategies
  }
}