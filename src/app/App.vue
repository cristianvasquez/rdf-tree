<script setup>
import { useFileDialog } from '@vueuse/core'
import { lightTheme, NButton, NCard, NConfigProvider, NSpace } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { Readable } from 'readable-stream'
import { ref } from 'vue'
import { parseTurtle } from '../io/rdf-parser.js'
import EntityList from './components/EntityList.vue'
import { useStore } from './state.js'

const store = useStore()
const { entities, currentFocus } = storeToRefs(store)

const { files, open, reset, onChange } = useFileDialog({
  accept: '*.ttl, *.trig',
  multiple: false,
})

onChange(async (selectedFiles) => {
  if (selectedFiles) {
    const [file] = selectedFiles
    const reader = new FileReader()
    reader.onload = async (e) => await handleUserUpload(e.target.result, file)
    reader.readAsText(file)
  }
})

async function handleUserUpload (text, file) {
  const strStream = Readable.from(text)
  name.value = file.name
  parseError.value = undefined
  try {
    const dataset = await parseTurtle(strStream)
    store.setDataset(dataset)
  } catch (e) {
    parseError.value = `${e}\n${text}`
    entities.value = []
  }

}

const parseError = ref()
const name = ref()
</script>

<template>
  <n-config-provider :theme="lightTheme">
    <n-card>
      <n-space>
        <n-button type="info" @click="open()">
          Select turtle or Trig
        </n-button>
        {{ name }}
        <n-button v-if="currentFocus" @click="store.reset()">{{ currentFocus }}</n-button>
      </n-space>
    </n-card>

    {{ parseError }}
    <div class="entity-container">
      <EntityList :entities="entities"/>
    </div>

  </n-config-provider>
</template>
<style>

.entity-container {
  background-color: white;
}
</style>
