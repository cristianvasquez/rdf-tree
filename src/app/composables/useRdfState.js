import { ref } from 'vue'
import { ns } from '../../namespaces.js'
import { getEntities } from '../../traversers/entities.js'
import { getRelatedTerms } from '../components/interaction/lookup.js'

/**
 * RDF State composable - replaces Pinia store
 * Maintains identical API for backward compatibility
 */
export function useRdfState() {
  const entities = ref([])
  const uriToIds = ref()
  const currentPointer = ref()
  const currentFocus = ref()
  const currentOptions = ref({})
  const isLoading = ref(false)

  async function setPointer(pointer, options = {}) {
    currentPointer.value = pointer
    currentOptions.value = options
    await defaultFacet(options)
  }

  async function defaultFacet(providedOptions = {}) {
    currentFocus.value = undefined
    const defaultMatchers = [
      { // Priority for entities of type
        predicate: ns.rdf.type,
        object: ns.epo.Procedure,
      },
      { // Priority for entities of type
        predicate: ns.rdf.type,
        object: ns.epo.Notice,
      },
      {}, // Everything else
    ]
    
    const options = {
      matchers: defaultMatchers,
      ...providedOptions, // Override defaults with provided options
    }
    await traverseDataset(options)
  }

  async function termFacet(term) {
    currentFocus.value = term
    const options = {
      maxDepth: 1,
      matchers: [
        {
          subject: term,
        },
        {
          predicate: term,
        },
        {
          object: term,
        },
      ],
    }
    await traverseDataset(options)
  }

  async function traverseDataset(options) {
    isLoading.value = true

    try {
      // Optional delay to let UI show loading spinner
      await new Promise(resolve => setTimeout(resolve, 50))
      const result = getEntities(currentPointer.value.dataset, options)
      entities.value = result.entities
      uriToIds.value = result.uriToIds
    } catch (error) {
      console.error('Error traversing dataset:', error)
    } finally {
      isLoading.value = false
    }
  }

  function getRelated(term) {
    return getRelatedTerms(currentPointer.value.dataset, term)
  }

  function getTermIds(term) {
    if (!term || !uriToIds.value || typeof uriToIds.value.get !== 'function') {
      return []
    }
    const result = uriToIds.value.get(term)
    return Array.isArray(result) ? result : []
  }

  function clearPointer() {
    currentPointer.value = undefined
    currentFocus.value = undefined
    entities.value = []
    uriToIds.value = undefined
  }

  function reset() {
    if (currentPointer.value) {
      currentFocus.value = undefined
      defaultFacet(currentOptions.value)
    }
  }

  return {
    // State
    entities,
    currentFocus,
    isLoading,
    
    // Methods - identical API to Pinia store
    clearPointer,
    getTermIds,
    getRelated,
    setPointer,
    termFacet,
    defaultFacet,
    reset,
  }
}