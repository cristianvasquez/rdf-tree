import { ref, reactive, computed } from 'vue'
import { DOMHighlightingService } from '../../services/dom-highlighting-service.js'
import { getBackgroundStyle } from '../components/interaction/colors.js'

/**
 * Composable for entity highlighting functionality
 * Uses service-based architecture for DOM manipulation and reactive state management
 */
export function useEntityHighlighting(store) {
  // Lazy initialize DOM service to avoid document access during imports
  let domService = null
  const getDomService = () => {
    if (!domService) {
      domService = new DOMHighlightingService()
    }
    return domService
  }
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
    if (!Array.isArray(entityIds) || entityIds.length === 0) return
    
    entityIds.forEach(id => {
      if (!id) return // Skip null/undefined IDs
      
      const existing = highlightedEntities.get(id) || new Set()
      existing.add(highlightType)
      highlightedEntities.set(id, existing)
    })
  }
  
  /**
   * Remove specific highlight type from entity IDs
   */
  function removeHighlight(entityIds, highlightType) {
    if (!Array.isArray(entityIds) || entityIds.length === 0) return
    
    entityIds.forEach(id => {
      if (!id) return // Skip null/undefined IDs
      
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
   * Store current highlighting state
   */
  function storeCurrentState(term, related) {
    currentHighlightedTerm.value = term
    currentRelated.value = related
  }

  /**
   * Extract graph values for a term from termToGraphs mapping
   */
  function extractGraphValues(term, termToGraphs) {
    if (!termToGraphs || !term) return []
    
    const graphSet = termToGraphs.get(term)
    return graphSet ? [...graphSet].map(x => x.value || 'Default') : []
  }

  /**
   * Create highlight operation function for a specific relation class
   */
  function createHighlightOperation(termToGraphs) {
    return (relationClass) => (highlightTerm) => {
      const ids = safeGetTermIds(highlightTerm)
      const graphValues = extractGraphValues(highlightTerm, termToGraphs)
      const backgroundStyle = getBackgroundStyle(graphValues, false)
      
      // Apply DOM highlighting using service
      ids.forEach(id => {
        getDomService().applyHighlightToElement(id, relationClass, backgroundStyle)
      })
      
      // Update reactive state
      addHighlight(ids, relationClass)
    }
  }

  /**
   * Apply highlighting to related terms using service-based architecture
   */
  function highlightRelated(term, related) {
    if (!term || !related) return
    
    storeCurrentState(term, related)
    const { incomingTerms = [], outgoingTerms = [], termToGraphs } = related
    
    const highlightOperation = createHighlightOperation(termToGraphs)
    
    // Apply highlights in defined order
    incomingTerms?.forEach(highlightOperation('incoming'))
    highlightOperation('same')(term)  // Same entities get same-highlight
    outgoingTerms?.forEach(highlightOperation('outgoing'))
  }
  
  
  /**
   * Create remove highlighting operation function for a specific relation class
   */
  function createRemoveOperation() {
    return (relationClass) => (highlightTerm) => {
      const ids = safeGetTermIds(highlightTerm)
      
      // Remove DOM highlighting using service
      ids.forEach(id => {
        getDomService().removeHighlightFromElement(id, relationClass)
      })
      
      // Update reactive state
      removeHighlight(ids, relationClass)
    }
  }

  /**
   * Remove all highlighting for the current term using service-based architecture
   */
  function removeAllHighlighting() {
    if (!currentHighlightedTerm.value || !currentRelated.value) return
    
    const { incomingTerms = [], outgoingTerms = [] } = currentRelated.value
    const removeOperation = createRemoveOperation()

    // Remove highlights in defined order
    incomingTerms?.forEach(removeOperation('incoming'))
    removeOperation('same')(currentHighlightedTerm.value)
    outgoingTerms?.forEach(removeOperation('outgoing'))
    
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
   * Get all highlighted entity IDs (cached for performance)
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