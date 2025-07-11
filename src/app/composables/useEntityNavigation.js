import { ref, reactive } from 'vue'

/**
 * Composable for entity navigation functionality
 * Handles scrolling to entities and cycling through same-URI entities
 */
export function useEntityNavigation(store) {
  // Reactive state for tracking scroll highlighting
  const highlightedEntity = ref(null)
  
  // Registry of entity elements by ID
  const entityElements = reactive(new Map())
  
  /**
   * Register an entity element for navigation
   */
  function registerEntity(id, element) {
    if (element) {
      entityElements.set(id, element)
    }
  }
  
  /**
   * Unregister an entity element
   */
  function unregisterEntity(id) {
    entityElements.delete(id)
  }
  
  /**
   * Scroll to a specific entity by ID
   */
  function scrollToEntity(id) {
    const element = entityElements.get(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Set highlight state reactively instead of direct DOM manipulation
      highlightedEntity.value = id
      
      // Remove highlight after animation
      setTimeout(() => {
        if (highlightedEntity.value === id) {
          highlightedEntity.value = null
        }
      }, 2000)
    } else {
      // Fallback to original DOM method if element not registered
      console.warn(`Entity ${id} not registered, falling back to getElementById`)
      const element = document.getElementById(id)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        element.classList.add('scrolled-to')
        setTimeout(() => {
          element.classList.remove('scrolled-to')
        }, 2000)
      }
    }
  }
  
  /**
   * Cycle through entities with the same URI
   */
  function cycleSameEntities(pointer) {
    if (!pointer?.id || !pointer?.term) {
      return
    }
    
    const sameTermIds = store.getTermIds(pointer.term)
    if (!sameTermIds.length) {
      return
    }
    
    // Sort for consistent cycling order
    const sorted = [...sameTermIds].sort()
    const currentIndex = sorted.indexOf(pointer.id)
    
    if (currentIndex === -1) {
      // Current ID not found, go to first
      scrollToEntity(sorted[0])
    } else {
      // Go to next (wrap around)
      const nextIndex = (currentIndex + 1) % sorted.length
      scrollToEntity(sorted[nextIndex])
    }
  }
  
  /**
   * Check if an entity should show scroll highlight
   */
  function isScrollHighlighted(id) {
    return highlightedEntity.value === id
  }
  
  return {
    // State
    highlightedEntity,
    
    // Methods
    registerEntity,
    unregisterEntity,
    scrollToEntity,
    cycleSameEntities,
    isScrollHighlighted,
    
    // Computed helpers
    entityElements: entityElements // for debugging
  }
}