<script setup>
import { lightTheme, NButton, NConfigProvider, NSpin } from 'naive-ui'
import { ref, onMounted, provide, toRef } from 'vue'
import EntityList from './components/EntityList.vue'
import { useRdfState } from './composables/useRdfState.js'
import { useEntityNavigation } from './composables/useEntityNavigation.js'

// Props
const props = defineProps({
  pointer: {
    type: Object,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({}),
  },
  enableHighlighting: {
    type: Boolean,
    default: true,
  },
  enableRightClick: {
    type: Boolean,
    default: true,
  },
  termComponent: {
    type: [Object, String],
    default: null,
  },
  cssClassifier: {
    type: Function,
    default: null,
  },
})

const store = useRdfState()
const { entities, currentFocus, isLoading } = store

// Create navigation composable and provide it to child components
const navigation = useEntityNavigation(store)
provide('entityNavigation', navigation)

// Provide the store to child components
provide('rdfStore', store)

// Provide reactive configuration options to child components
provide('enableHighlighting', toRef(props, 'enableHighlighting'))
provide('enableRightClick', toRef(props, 'enableRightClick'))

// Provide custom term component to child components
provide('termComponent', toRef(props, 'termComponent'))

// Provide CSS classifier function to child components
provide('cssClassifier', toRef(props, 'cssClassifier'))

// Initialize with provided pointer
onMounted(async () => {
  await store.setPointer(props.pointer, props.options)
})
</script>

<template>
  <n-config-provider :theme="lightTheme">
    <div v-if="currentFocus" style="padding: 10px 0;">
      <n-button @click="store.reset()">
        {{ currentFocus }}
      </n-button>
    </div>
    <div class="entity-container">
      <n-spin :show="isLoading">
        <EntityList :entities="entities"/>
      </n-spin>
    </div>
  </n-config-provider>
</template>

<style>
body {
  --border: #463838;
  --metadata: #463838;
}

.entity-container {
  background-color: white;
  min-height: 100px;
}

.entities {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-right: 1px solid var(--border);
}

.entity {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--border);
  border-left: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.entity-header {
  background: #0000000d;
}

.entity-header > div {
  margin: 5px;
}

.rows {
  display: flex;
  flex-direction: column;
}

.rows > .row {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.row > .property {
  align-self: flex-start;
  min-width: 100px;
  word-wrap: break-word;
  margin: .5rem .5rem .5rem 1%;
}

.row > .value {
  flex: 2;
  margin-left: .5rem;
  margin-bottom: .5rem;
  margin-top: .5rem;
}

.rdf-container .row > .value > li > div:not([class]) {
  word-wrap: break-word;
}

ul {
  display: flex;
  flex-direction: column;
  list-style: none;
  gap: 5px;
  justify-content: center;
  padding-left: 5px;
}

ol {
  display: flex;
  flex-direction: column;
  gap: 5px;
  justify-content: center;
  padding-left: 5px;
}

/** Used by Term **/

.vocab {
  color: var(--metadata);
  font-size: .8rem;
}

.language, .datatype {
  color: var(--metadata);
  font-size: .7rem;
  margin-left: 4px;
}

/** Used by Composables **/

.incoming-highlight {
  outline: 1px solid rgba(70, 56, 56, 0.4);
  outline-offset: 1px;
  border-radius: 4px;
}

.same-highlight {
  outline: 1px solid rgba(21, 51, 231, 0.6);
  outline-offset: 1px;
  border-radius: 4px;
}

.outgoing-highlight {
  outline: 1px solid rgba(70, 56, 56, 0.4);
  outline-offset: 1px;
  border-radius: 4px;
}

.scrolled-to {
  animation: flash 5s ease-out;
}

@keyframes flash {
  0% {
    background-color: rgba(255, 255, 100, 0.5);
  }
  100% {
    background-color: transparent;
  }
}
</style>
