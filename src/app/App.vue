<script setup>
import { lightTheme, NButton, NCard, NConfigProvider, NSpace, NUpload, NSpin } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { Readable } from 'readable-stream'
import { ref, computed, watch } from 'vue'
import { parseTurtle } from '../io/rdf-parser.js'
import EntityList from './components/EntityList.vue'
import { useStore } from './state.js'
import rdf from 'rdf-ext'

const store = useStore()
const { entities, currentFocus, isLoading } = storeToRefs(store)

const uploadRef = ref(null)
const fileList = ref([])
const parseError = ref()
const isProcessing = ref(false)

// Compute the number of files in the list
const fileListLength = computed(() => fileList.value.length)

// Compute display text for selected files
const uploadedFilesDisplay = computed(() => {
  if (fileListLength.value === 0) return ''
  if (fileListLength.value === 1) return fileList.value[0].name
  return `${fileListLength.value} files uploaded`
})

// Watch for changes in fileList and automatically process files
watch(fileList, async (newFileList) => {
  if (newFileList.length > 0 && !isProcessing.value) {
    await handleUpload()
  } else if (newFileList.length === 0) {
    // Clear the dataset when all files are removed
    store.clearDataset()
    parseError.value = undefined
  }
}, { deep: true })

function handleChange(data) {
  fileList.value = data.fileList
}

async function handleUpload() {
  parseError.value = undefined

  if (fileList.value.length === 0) {
    return
  }

  try {
    isProcessing.value = true

    // Process all files (works for single or multiple)
    const mergedDataset = await processFiles(fileList.value.map(item => item.file))
    await store.setDataset(mergedDataset)
  } catch (e) {
    parseError.value = `Upload failed: ${e.message}`
    store.entities = []
  } finally {
    isProcessing.value = false
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file)
  })
}

async function processFiles(files) {
  const mergedDataset = rdf.dataset()

  // Process each file
  for (const file of files) {
    try {
      const fileContent = await readFileAsText(file)
      const strStream = Readable.from(fileContent)
      const dataset = await parseTurtle(strStream)

      // Add each quad to the merged dataset, rewriting default graph to use filename
      for (const quad of dataset) {
        const graphName = quad.graph.termType === 'DefaultGraph'
            ? { termType: 'NamedNode', value: file.name }
            : quad.graph

        mergedDataset.add({
          subject: quad.subject,
          predicate: quad.predicate,
          object: quad.object,
          graph: graphName
        })
      }
    } catch (e) {
      // Handle error for this specific file
      parseError.value = `Error processing ${file.name}: ${e}`
      console.error(`Error processing ${file.name}:`, e)
      // Continue with other files
    }
  }

  return mergedDataset
}
</script>

<template>
  <n-config-provider :theme="lightTheme">
    <n-card>
      <n-space vertical>
        <n-space>
          <n-upload
              ref="uploadRef"
              :default-upload="false"
              :accept="'.ttl, .trig'"
              multiple
              @change="handleChange"
          >
            <n-button>Select turtle or Trig files</n-button>
          </n-upload>

          <span v-if="uploadedFilesDisplay">{{ uploadedFilesDisplay }}</span>

          <n-spin size="small" v-if="isProcessing" />

          <n-button v-if="currentFocus" @click="store.reset()">
            {{ currentFocus }}
          </n-button>
        </n-space>

        <div v-if="parseError" class="error">{{ parseError }}</div>
      </n-space>
    </n-card>

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
