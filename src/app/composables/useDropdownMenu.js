import { ref, computed } from 'vue'

/**
 * Composable for dropdown menu functionality
 * Handles building and managing entity context menus
 */
export function useDropdownMenu(store) {
  const menuOptions = ref([])
  const currentRelated = ref(null)
  
  /**
   * Safe wrapper for getting term IDs with error handling
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
   * Build dropdown options for a term with multiple entity instances
   */
  function termToDropdown(term, currentId) {
    const ids = safeGetTermIds(term)
    return ids.map(id => ({
      label: id === currentId ? `${id} (current)` : id,
      key: `entity-${id}`,
    }))
  }
  
  /**
   * Build a section of the dropdown menu for a group of terms
   */
  function buildTermSection(terms, label, currentId) {
    return {
      label: `${label} (${terms.length})`,
      key: label,
      children: terms.map(term => {
        const termLabel = term?.value || '[unknown]'
        const ids = safeGetTermIds(term)
        
        // If there's only one ID, don't create nested structure
        if (ids.length === 1) {
          const id = ids[0]
          return {
            label: `${termLabel} - ${id === currentId ? `${id} (current)` : id}`,
            key: `entity-${id}`,
          }
        }
        
        // If multiple IDs, use nested structure
        return {
          label: termLabel,
          key: `term-${termLabel}`,
          children: termToDropdown(term, currentId),
        }
      }),
    }
  }
  
  /**
   * Build complete menu options from related terms data
   */
  function buildMenuOptions(related, pointer) {
    const { incomingTerms = [], outgoingTerms = [], graphs = [] } = related
    const currentId = pointer?.id
    const options = []
    
    // Add outgoing terms section
    if (outgoingTerms.length) {
      options.push(buildTermSection(outgoingTerms, 'outgoing', currentId))
    }
    
    // Add incoming terms section
    if (incomingTerms.length) {
      options.push(buildTermSection(incomingTerms, 'incoming', currentId))
    }
    
    // Add same-URI entities section
    const sameIds = safeGetTermIds(pointer?.term)
    const otherSameIds = sameIds.filter(id => id !== currentId)
    if (otherSameIds.length) {
      options.push({
        label: `🔗 (${otherSameIds.length})`,
        key: 'same',
        children: termToDropdown(pointer.term, currentId),
      })
    }
    
    // Add graphs section
    if (graphs.length > 0) {
      options.push({ type: 'divider', key: 'divider' })
      options.push({
        label: `G (${graphs.length})`,
        key: 'graphs',
        children: graphs.map(g => ({
          label: g.value || 'Default',
          key: `graph-${g.value || 'default'}`,
        })),
      })
    }
    
    // Add select action
    options.push({ label: 'select', key: 'select' })
    
    return options
  }
  
  /**
   * Update menu options based on pointer and related terms
   */
  function updateMenu(pointer, related) {
    currentRelated.value = related
    menuOptions.value = buildMenuOptions(related, pointer)
  }
  
  /**
   * Clear menu options
   */
  function clearMenu() {
    menuOptions.value = []
    currentRelated.value = null
  }
  
  /**
   * Parse menu selection key and extract type and value
   */
  function parseMenuKey(key) {
    if (key.startsWith('entity-')) {
      return {
        type: 'entity',
        value: key.replace('entity-', '')
      }
    } else if (key.startsWith('graph-')) {
      return {
        type: 'graph', 
        value: key.replace('graph-', '')
      }
    } else if (key === 'select') {
      return {
        type: 'select',
        value: null
      }
    }
    return {
      type: 'unknown',
      value: key
    }
  }
  
  // Computed helpers
  const hasMenuOptions = computed(() => menuOptions.value.length > 0)
  const menuCount = computed(() => menuOptions.value.length)
  
  return {
    // State
    menuOptions,
    currentRelated,
    
    // Methods
    updateMenu,
    clearMenu,
    parseMenuKey,
    buildMenuOptions,
    buildTermSection,
    termToDropdown,
    safeGetTermIds,
    
    // Computed
    hasMenuOptions,
    menuCount
  }
}