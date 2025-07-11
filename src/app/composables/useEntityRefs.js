import { reactive, readonly } from 'vue'

/**
 * Composable for managing entity element references
 * Provides centralized registry for DOM elements by entity ID
 */
export function useEntityRefs() {
  // Map of entity ID to DOM element
  const entityRefs = reactive(new Map())
  
  /**
   * Register an entity element by ID
   */
  function registerEntity(id, element) {
    if (!id) {
      console.warn('Cannot register entity: ID is required')
      return
    }
    
    if (!element) {
      console.warn(`Cannot register entity ${id}: element is required`)
      return
    }
    
    entityRefs.set(id, element)
  }
  
  /**
   * Unregister an entity element by ID
   */
  function unregisterEntity(id) {
    if (entityRefs.has(id)) {
      entityRefs.delete(id)
    }
  }
  
  /**
   * Get an entity element by ID
   */
  function getEntity(id) {
    return entityRefs.get(id)
  }
  
  /**
   * Check if an entity is registered
   */
  function hasEntity(id) {
    return entityRefs.has(id)
  }
  
  /**
   * Get all registered entity IDs
   */
  function getRegisteredIds() {
    return Array.from(entityRefs.keys())
  }
  
  /**
   * Clear all registered entities
   */
  function clearAll() {
    entityRefs.clear()
  }
  
  /**
   * Get count of registered entities
   */
  function getCount() {
    return entityRefs.size
  }
  
  /**
   * Create a ref callback for Vue template refs
   * Usage in template: :ref="createRefCallback(entity.id)"
   */
  function createRefCallback(id) {
    return (element) => {
      if (element) {
        registerEntity(id, element)
      } else {
        unregisterEntity(id)
      }
    }
  }
  
  /**
   * Batch register entities from an array
   */
  function registerEntities(entities) {
    entities.forEach(({ id, element }) => {
      if (id && element) {
        registerEntity(id, element)
      }
    })
  }
  
  /**
   * Batch unregister entities by IDs
   */
  function unregisterEntities(ids) {
    ids.forEach(id => unregisterEntity(id))
  }
  
  /**
   * Find entities by a predicate function
   */
  function findEntities(predicate) {
    const results = []
    for (const [id, element] of entityRefs) {
      if (predicate(id, element)) {
        results.push({ id, element })
      }
    }
    return results
  }
  
  /**
   * Validate all registered elements (remove stale references)
   */
  function validateRefs() {
    const staleIds = []
    
    for (const [id, element] of entityRefs) {
      // Check if element is still in the DOM
      if (!element.isConnected) {
        staleIds.push(id)
      }
    }
    
    // Remove stale references
    staleIds.forEach(id => unregisterEntity(id))
    
    return staleIds.length
  }
  
  return {
    // State (readonly to prevent external mutation)
    entityRefs: readonly(entityRefs),
    
    // Registration methods
    registerEntity,
    unregisterEntity,
    registerEntities,
    unregisterEntities,
    
    // Query methods
    getEntity,
    hasEntity,
    getRegisteredIds,
    getCount,
    findEntities,
    
    // Utility methods
    createRefCallback,
    clearAll,
    validateRefs
  }
}