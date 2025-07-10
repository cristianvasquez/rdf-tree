<script setup>
import { lightTheme, NButton, NConfigProvider, NSpin } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { Readable } from 'readable-stream'
import { ref, computed, watch, onMounted } from 'vue'
import { parseTurtle } from '../io/rdf-parser.js'
import EntityList from './components/EntityList.vue'
import { useStore } from './state.js'
import rdf from 'rdf-ext'

// Props
const props = defineProps({
  initialFile: {
    type: String,
    default: null
  },
  initialFiles: {
    type: Array,
    default: null
  }
})

const store = useStore()
const { entities, currentFocus, isLoading } = storeToRefs(store)

const parseError = ref()
const isExternalResource = ref(false)

// Move initial dataset loading to onMounted
onMounted(async () => {
  // Handle multiple files (new format) or single file (legacy)
  let filesToLoad = []
  
  if (props.initialFiles && props.initialFiles.length > 0) {
    filesToLoad = props.initialFiles
  } else if (props.initialFile) {
    filesToLoad = [props.initialFile]
  } else if (import.meta.env.VITE_INITIAL_RDF_FILES) {
    filesToLoad = import.meta.env.VITE_INITIAL_RDF_FILES
  } else if (import.meta.env.VITE_INITIAL_RDF_FILE) {
    filesToLoad = [import.meta.env.VITE_INITIAL_RDF_FILE]
  }
  
  if (filesToLoad.length > 0) {
    try {
      isExternalResource.value = true
      
      // Process multiple files using existing logic
      const mergedDataset = rdf.dataset()
      
      for (const fileUrl of filesToLoad) {
        try {
          const response = await fetch(fileUrl)
          const fileContent = await response.text()
          const strStream = Readable.from(fileContent)
          const dataset = await parseTurtle(strStream)
          
          // Extract filename from URL for graph naming
          const fileName = fileUrl.split('/').pop()
          
          // Add each quad to merged dataset with filename as graph for default graphs
          for (const quad of dataset) {
            const graphName = quad.graph.termType === 'DefaultGraph'
                ? { termType: 'NamedNode', value: fileName }
                : quad.graph

            mergedDataset.add({
              subject: quad.subject,
              predicate: quad.predicate,
              object: quad.object,
              graph: graphName,
            })
          }
        } catch (e) {
          console.error(`Error processing ${fileUrl}:`, e)
          parseError.value = `Failed to load ${fileUrl}: ${e.message}`
        }
      }
      
      await store.setDataset(mergedDataset)
    } catch (e) {
      parseError.value = `Failed to load files: ${e.message}`
    }
  }
})
</script>

<template>
  <n-config-provider :theme="lightTheme">
    <div v-if="currentFocus" style="padding: 10px 0;">
      <n-button @click="store.reset()">
        {{ currentFocus }}
      </n-button>
    </div>

    <div v-if="parseError" class="error">{{ parseError }}</div>

    <div class="entity-container">
      <n-spin :show="isLoading">
        <EntityList :entities="entities"/>
      </n-spin>
    </div>

  </n-config-provider>
</template>

<style>
.entity-container {
  background-color: white;
  min-height: 100px;
}

.error {
  color: red;
  white-space: pre-wrap;
  padding: 1rem;
  background-color: #ffeeee;
  border: 1px solid #ffcccc;
  margin: 1rem 0;
}
</style>
