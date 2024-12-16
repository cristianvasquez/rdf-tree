<script setup>
import { useFileDialog } from '@vueuse/core'
import { lightTheme, NButton, NCard, NConfigProvider, NSpace, NCheckbox } from 'naive-ui'
import { ref, provide } from 'vue'
import { getEntities } from '../traversers/bfsEntity.js'
import { ns } from '../namespaces.js'
import EntityList from './components/EntityList.vue'
import { parseTurtle } from '../io/rdf-parser.js'
import { Readable } from 'readable-stream'

const entities = ref([])
const apiLinks = ref([])

const { files, open, reset, onChange } = useFileDialog({
  accept: '*.ttl, *.trig',
  multiple: false,
})

onChange(async (selectedFiles) => {
  if (selectedFiles) {
    const [file] = selectedFiles
    apiLinks.value = []
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

    const options = {
      ignoreNamedGraphs: true,
      matchers: [
        { // Priority for entities of type Notice
          predicate: ns.rdf.type,
          object: ns.epo.Notice,
        },
        {}, // Everything else
      ],
    }

    entities.value = getEntities(dataset, options)
  } catch (e) {
    parseError.value = `${e}\n${text}`
    entities.value = []
  }

}

const parseError = ref()
const name = ref()
const displayWarnings = ref(true)
provide('displayWarnings', displayWarnings)
</script>

<template>

  <n-config-provider :theme="lightTheme">
    <n-card>
      <n-space>
        <n-button type="info" @click="open()">
          Select turtle or Trig
        </n-button>
        {{ name }}

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
