<script setup>
import { NDropdown, NButton } from 'naive-ui'
import { computed, ref } from 'vue'
import { useStore } from '../state.js'

const props = defineProps({
  pointer: Object,
})

const store = useStore()

const relatedEntities = computed(() => {
  return store.getIdsForTerm(props.pointer.term)
})
const otherRelatedEntities = computed(() => {
  return relatedEntities.value.filter(id => id !== props.pointer.id)
})

const menuOptions = computed(() => {
  const options = []

  otherRelatedEntities.value.forEach(id => {
    options.push({
      label: `${id}`,
      key: `entity-${id}`,
    })
  })

  if (otherRelatedEntities.value.length &&
      (props.pointer.meta?.types?.length || props.pointer.meta?.graphs?.length)) {
    options.push({
      type: 'divider',
      key: 'divider',
    })
  }

  if (props.pointer.meta?.graphs?.length) {
    options.push({
      label: 'Graphs',
      key: 'graphs',
      children: props.pointer.meta.graphs.map(graph => ({
        label: graph.value,
        key: `graph-${graph.value}`,
      })),
    })
  }

  return options
})

function handleSelect (key) {
  if (key.startsWith('entity-')) {
    const id = key.replace('entity-', '')
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      element.classList.add('scrolled-to')
      setTimeout(() => {
        element.classList.remove('scrolled-to')
      }, 2000)
    }
  }

  if (key.startsWith('graph-')) {
    const id = key.replace('graph-', '')
    const graph = props.pointer.meta.graphs.find(x => x.value === id)
    console.log('select', graph)
  }
}

function highlightRelated () {
  relatedEntities.value.forEach(id => {
    const element = document.getElementById(id)
    if (element) {
      element.classList.add('related-highlight')
    }
  })
}

function removeHighlight () {
  relatedEntities.value.forEach(id => {
    const element = document.getElementById(id)
    if (element) {
      element.classList.remove('related-highlight')
    }
  })
}
</script>

<template>
  <template v-if="menuOptions.length">
    <n-dropdown
        :options="menuOptions"
        placement="right"
        trigger="hover"
        @select="handleSelect"
    >
      <n-button
          @mouseenter="highlightRelated"
          @mouseleave="removeHighlight"
      >
        <slot></slot>
      </n-button>
    </n-dropdown>
  </template>
  <template v-else>
    <slot></slot>
  </template>
</template>

<style>
.related-highlight {
  outline: 2px solid #2080f0;
  background-color: rgba(32, 128, 240, 0.1);
}
</style>
