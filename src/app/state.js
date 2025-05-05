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

  // This code smells, TODO refactor
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
      // Use setTimeout to allow UI to update before starting heavy computation
      setTimeout(() => {
        const result = getEntities(currentDataset.value, options)
        entities.value = result.entities
        uriToIds.value = result.uriToIds
        isLoading.value = false
      }, 50)
    } catch (error) {
      console.error('Error traversing dataset:', error)
      isLoading.value = false
    }
  }

  function getRelated (term) {
    return getRelatedTerms(currentDataset.value, term)
  }

  function getTermIds (term) {
    return uriToIds.value.get(term)
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
