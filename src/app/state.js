import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ns } from '../namespaces.js'
import { getEntities } from '../traversers/entities.js'

const facets = {
  typeOf: (type) => {
    return {
      matchers: [
        { // Priority for entities of type
          predicate: ns.rdf.type,
          object: type,
        },
        {}, // Everything else
      ],
    }
  },
  focusOn: (term) => {
    return {
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
  },

}

export const useStore = defineStore('state', () => {

  const entities = ref([])
  const uriToIds = ref()
  const currentDataset = ref()
  const currentFocus = ref()

  // This code smells, TODO refactor
  function setDataset (dataset) {
    currentDataset.value = dataset
    reset()
  }

  function reset () {
    currentFocus.value = undefined
    const options = facets.typeOf(ns.epo.Notice)
    traverseDataset(options)
  }

  function focusOn (term) {
    currentFocus.value = term
    const options = facets.focusOn(term)
    traverseDataset(options)
  }

  function traverseDataset (options) {
    const result = getEntities(currentDataset.value, options)
    entities.value = result.entities
    uriToIds.value = result.uriToIds
  }

  function getIdsForTerm (term) {
    if (!uriToIds.value || !uriToIds.value.has(term)) {
      return []
    }
    return [...uriToIds.value.get(term)]
  }

  return {
    entities,
    getIdsForTerm,
    setDataset,
    focusOn,
    reset,
    currentFocus,
  }
})
