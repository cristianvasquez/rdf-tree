import { ref, reactive, computed } from 'vue'

/**
 * Composable for entity highlighting functionality
 * Replaces direct DOM manipulation with reactive state management
 */
export function useEntityHighlighting(store) {
  // Map of entity ID to highlight types
  const highlightedEntities = reactive(new Map())
  
  // Current highlighted term and related data
  const currentHighlightedTerm = ref(null)
  const currentRelated = ref(null)
  
  /**
   * Safe wrapper for getting term IDs
   */
  function safeGetTermIds(term) {
    try {
      const result = store.getTermIds(term)
      return Array.isArray(result) ? result : []
    } catch {
      return []
    }
  }
  
  /**
   * Add highlight for a set of entity IDs with a specific type
   */
  function addHighlight(entityIds, highlightType) {
    entityIds.forEach(id => {
      const existing = highlightedEntities.get(id) || new Set()
      existing.add(highlightType)
      highlightedEntities.set(id, existing)
    })
  }
  
  /**
   * Remove specific highlight type from entity IDs
   */
  function removeHighlight(entityIds, highlightType) {
    entityIds.forEach(id => {
      const existing = highlightedEntities.get(id)
      if (existing) {
        existing.delete(highlightType)
        if (existing.size === 0) {
          highlightedEntities.delete(id)
        }
      }
    })
  }
  
  /**
   * Apply highlighting to related terms (using original DOM manipulation approach)
   */
  function highlightRelated(term, related) {
    if (!term || !related) return
    
    // Store current state
    currentHighlightedTerm.value = term
    currentRelated.value = related
    
    const { incomingTerms = [], outgoingTerms = [], termToGraphs } = related
    
    // Use original highlighting approach with direct DOM manipulation
    const applyHighlight = (relationClass) => (highlightTerm) => {
      const graphValues = [...(termToGraphs?.get(highlightTerm) ?? [])].map(
        x => x.value || 'Default')
      
      // Get background style for graphs
      const backgroundStyle = getBackgroundStyle(graphValues, false)
      
      const ids = safeGetTermIds(highlightTerm)
      ids.forEach(id => {
        const element = document.getElementById(id)
        if (element) {
          // Add border highlight class
          element.classList.add(`${relationClass}-highlight`)
          
          // Apply background colors for graph highlighting
          Object.assign(element.style, {
            // Store original background to restore later
            '--original-background': element.style.background || 'transparent',
            '--original-backgroundImage': element.style.backgroundImage || 'none',
            // Apply new background from graphs
            ...backgroundStyle,
          })
          
          // Mark as highlighted for cleanup
          element.setAttribute('data-highlighted-graphs', 'true')
        }
      })
      
      // Also add to reactive state for CSS classes
      addHighlight(ids, relationClass)
    }
    
    // Apply highlights in original order
    incomingTerms?.forEach(applyHighlight('incoming'))
    applyHighlight('same')(term)  // Same entities get same-highlight
    outgoingTerms?.forEach(applyHighlight('outgoing'))
  }
  
  /**
   * Import background style function from colors.js
   */
  function getBackgroundStyle(graphValues, ignoreParents = false) {
    // Simple fallback - you might want to import the actual function
    if (!graphValues || graphValues.length === 0) return {}
    
    const graphColors = [
      'rgba(190, 190, 190, 0.1)',  // Light Gray
      'rgba(120, 200, 130, 0.1)',  // Soft Green
      'rgba(100, 180, 255, 0.1)',  // Light Blue
      'rgba(255, 180, 70, 0.1)',   // Warm Orange
      'rgba(220, 140, 250, 0.1)',  // Soft Purple
      'rgba(255, 100, 120, 0.1)',  // Bright Red
      'rgba(80, 210, 230, 0.1)',   // Aqua Cyan
      'rgba(255, 240, 80, 0.1)',   // Pastel Yellow
    ]
    
    if (graphValues.length === 1) {
      const color = graphColors[0] // Simple approach
      return { background: color }
    }
    
    // Multiple graphs
    const backgroundLayers = graphValues.map((_, i) => graphColors[i % graphColors.length])
    return {
      backgroundImage: `linear-gradient(45deg, ${backgroundLayers.join(', ')})`,
    }
  }
  
  /**
   * Remove all highlighting for the current term (using original DOM cleanup)
   */
  function removeAllHighlighting() {
    if (!currentHighlightedTerm.value || !currentRelated.value) return
    
    const { incomingTerms = [], outgoingTerms = [] } = currentRelated.value
    
    // Use original cleanup approach
    const removeHighlighting = (relationClass) => (highlightTerm) => {
      const ids = safeGetTermIds(highlightTerm)
      ids.forEach(id => {
        const element = document.getElementById(id)
        if (element) {
          // Remove border highlight class
          element.classList.remove(`${relationClass}-highlight`)

          // Restore original background if we applied graph highlighting
          if (element.getAttribute('data-highlighted-graphs') === 'true') {
            // Restore original background
            element.style.background = element.style.getPropertyValue(
              '--original-background') || ''
            element.style.backgroundImage = element.style.getPropertyValue(
              '--original-backgroundImage') || ''

            // Clean up custom properties
            element.style.removeProperty('--original-background')
            element.style.removeProperty('--original-backgroundImage')
            element.style.isolation = ''

            // Remove tracking attribute
            element.removeAttribute('data-highlighted-graphs')
          }
        }
      })
      
      // Also remove from reactive state
      removeHighlight(ids, relationClass)
    }

    // Remove highlights in original order
    incomingTerms?.forEach(removeHighlighting('incoming'))
    removeHighlighting('same')(currentHighlightedTerm.value)
    outgoingTerms?.forEach(removeHighlighting('outgoing'))
    
    // Clear current state
    currentHighlightedTerm.value = null
    currentRelated.value = null
  }
  
  /**
   * Clear all highlights
   */
  function clearAllHighlights() {
    highlightedEntities.clear()
    currentHighlightedTerm.value = null
    currentRelated.value = null
  }
  
  /**
   * Get highlight types for a specific entity ID
   */
  function getHighlightTypes(entityId) {
    return highlightedEntities.get(entityId) || new Set()
  }
  
  /**
   * Check if entity has a specific highlight type
   */
  function hasHighlightType(entityId, type) {
    const types = highlightedEntities.get(entityId)
    return types ? types.has(type) : false
  }
  
  /**
   * Get CSS classes for entity highlighting
   */
  function getHighlightClasses(entityId) {
    const types = getHighlightTypes(entityId)
    const classes = []
    
    if (types.has('incoming')) classes.push('incoming-highlight')
    if (types.has('outgoing')) classes.push('outgoing-highlight') 
    if (types.has('same')) classes.push('same-highlight')
    
    return classes
  }
  
  /**
   * Check if any entity is currently highlighted
   */
  const hasActiveHighlights = computed(() => highlightedEntities.size > 0)
  
  /**
   * Get count of highlighted entities
   */
  const highlightedCount = computed(() => highlightedEntities.size)
  
  /**
   * Get all highlighted entity IDs
   */
  const highlightedEntityIds = computed(() => Array.from(highlightedEntities.keys()))
  
  return {
    // State
    highlightedEntities,
    currentHighlightedTerm,
    currentRelated,
    
    // Methods
    highlightRelated,
    removeAllHighlighting,
    clearAllHighlights,
    getHighlightTypes,
    hasHighlightType,
    getHighlightClasses,
    addHighlight,
    removeHighlight,
    
    // Computed
    hasActiveHighlights,
    highlightedCount,
    highlightedEntityIds
  }
}