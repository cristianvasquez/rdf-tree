<script setup>
import { NDropdown, NButton } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { ns } from '../../namespaces.js'
import { useStore } from '../state.js'

const props = defineProps({
  pointer: Object,
})

const store = useStore()

const relatedEntities = computed(() => {
  return store.getIdsForTerm(props.pointer.term).filter(id => id !== props.pointer.id)
})

const menuOptions = computed(() => {
  const options = []

  relatedEntities.value.forEach(id => {
    options.push({
      label: `${id}`,
      key: `entity-${id}`,
    })
  })

  // Add divider if we have both related entities and metadata
  if (relatedEntities.value.length &&
      (props.pointer.meta?.types?.length || props.pointer.meta?.graphs?.length)) {
    options.push({
      type: 'divider',
      key: 'divider',
    })
  }

  // Add Types submenu if exists
  // if (props.pointer.meta?.types?.length) {
  //   options.push({
  //     label: 'Types',
  //     key: 'types',
  //     children: props.pointer.meta.types.map(type => ({
  //       label: type.value,
  //       key: `type-${type}`
  //     }))
  //   })
  // }

  // Add Graphs submenu if exists
  if (props.pointer.meta?.graphs?.length) {
    options.push({
      label: 'Graphs',
      key: 'graphs',
      children: props.pointer.meta.graphs.map(graph => ({
        label: graph.value,
        key: `graph-${graph}`,
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
</script>

<template>
  <template v-if="menuOptions.length">
    <n-dropdown
        :options="menuOptions"
        placement="right"
        trigger="hover"
        @select="handleSelect"
    >
      <n-button>
        <slot></slot>
      </n-button>
    </n-dropdown>
  </template>
  <template v-else>
    <slot></slot>
  </template>
</template>
