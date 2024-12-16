import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ns } from '../namespaces.js'
import { getEntities } from '../traversers/entities.js'

const tools = {
  typeOf: (type) => {
    return {
      ignoreNamedGraphs: true,
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
      ignoreNamedGraphs: true,
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
  const currentDataset = ref()
  const currentFocus = ref()

  // This code smells, TODO refactor
  function setDataset (dataset) {
    currentDataset.value = dataset
    reset()
  }

  function reset () {
    currentFocus.value = undefined
    const options = tools.typeOf(ns.epo.Notice)
    entities.value = getEntities(currentDataset.value, options)
  }

  function focusOn (term) {
    const options = tools.focusOn(term)
    currentFocus.value = term
    entities.value = getEntities(currentDataset.value, options)
  }

  return {
    entities,
    setDataset,
    focusOn,
    reset,
    currentFocus,
  }
})
