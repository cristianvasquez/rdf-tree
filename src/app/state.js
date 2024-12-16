import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ns } from '../namespaces.js'
import { getEntities } from '../traversers/entities.js'

export const useStore = defineStore('state', () => {

  const entities = ref([])
  const currentDataset = ref()

  function setDataset (dataset) {

    const options = {
      ignoreNamedGraphs: true,
      // maxDepth: 3,
      matchers: [
        { // Priority for entities of type Notice
          predicate: ns.rdf.type,
          object: ns.epo.Notice,
        },
        {}, // Everything else
      ],
    }

    currentDataset.value = dataset
    entities.value = getEntities(dataset, options)

  }

  function setMatchers (matchers) {
    const options = {
      ignoreNamedGraphs: true,
      matchers,
    }
    entities.value = getEntities(currentDataset.value, options)
  }

  return {
    entities,
    setDataset,
    setMatchers,
  }
})
