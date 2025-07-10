import { defineStore } from 'pinia'
import { ref, toRaw } from 'vue'
import { ns } from '../namespaces.js'
import { getEntities } from '../traversers/entities.js'
import { getRelatedTerms } from './components/interaction/lookup.js'

export const useStore = defineStore('state', () => {
  const entities = ref([])
  const uriToIds = ref()
  const currentDataset = ref()
  const currentFocus = ref()
  const isLoading = ref(false)

  async function setDataset (dataset) {
    currentDataset.value = dataset
    await defaultFacet()
  }

  async function defaultFacet () {
    currentFocus.value = undefined
    const options = {
      matchers: [
        { // Priority for entities of type
          predicate: ns.rdf.type,
          object: ns.epo.Procedure,
        },
        { // Priority for entities of type
          predicate: ns.rdf.type,
          object: ns.epo.Notice,
        },
        {}, // Everything else
      ],
    }
    await traverseDataset(options)
  }

  async function termFacet (term) {
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

  async function traverseDataset (options) {
    isLoading.value = true

    try {
      // Optional delay to let UI show loading spinner
      await new Promise(resolve => setTimeout(resolve, 50))
      const result = getEntities(currentDataset.value, options)
      entities.value = result.entities
      uriToIds.value = result.uriToIds
    } catch (error) {
      console.error('Error traversing dataset:', error)
    } finally {
      isLoading.value = false
    }
  }

  function getRelated (term) {
    return getRelatedTerms(currentDataset.value, term)
  }

  function getTermIds (term) {
    if (!term || !uriToIds.value || typeof uriToIds.value.get !== 'function') {
      return []
    }
    const result = uriToIds.value.get(term)
    return Array.isArray(result) ? result : []
  }

  function clearDataset () {
    currentDataset.value = undefined
    currentFocus.value = undefined
    entities.value = []
    uriToIds.value = undefined
  }

  return {
    clearDataset,
    entities,
    getTermIds,
    getRelated,
    setDataset,
    termFacet,
    defaultFacet,
    currentFocus,
    isLoading,
  }
})
