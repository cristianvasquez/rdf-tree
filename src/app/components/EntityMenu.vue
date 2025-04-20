<script setup>
import { NDropdown, NButton } from 'naive-ui'
import { ref } from 'vue'
import { useStore } from '../state.js'

const props = defineProps({
  pointer: Object,
})

const store = useStore()
const menuOptions = ref([])
const currentRelated = ref(null)


function loadOptions ({ incoming, same, outgoing }) {
  const options = []
  if (incoming.length) {
    options.push({
      label: 'Incoming',
      key: 'incoming',
      children: incoming.map(id => ({
        label: `${id}`,
        key: `entity-${id}`,
      })),
    })
  }

  if (same.length) {
    options.push({
      label: 'Same',
      key: 'same',
      children: same.map(id => ({
        label: `${id}`,
        key: `entity-${id}`,
      })),
    })
  }

  if (outgoing.length) {
    options.push({
      label: 'Outgoing',
      key: 'outgoing',
      children: outgoing.map(id => ({
        label: `${id}`,
        key: `entity-${id}`,
      })),
    })
  }

  if (props.pointer.meta?.graphs?.length) {
    options.push({
      type: 'divider',
      key: 'divider',
    })
    options.push({
      label: 'Graphs',
      key: 'graphs',
      children: props.pointer.meta.graphs.map(graph => ({
        label: graph.value,
        key: `graph-${graph.value}`,
      })),
    })
  }

  menuOptions.value = options
}

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

const applyClass = (clazz) => (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.classList.add(clazz)
  }
}

const removeClass = (clazz) => (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.classList.remove(clazz)
  }
}

function highlightRelated(related) {
  const { incoming, same, outgoing } = related
  incoming.forEach(applyClass('incoming-highlight'))
  same.forEach(applyClass('same-highlight'))
  outgoing.forEach(applyClass('outgoing-highlight'))
}

function removeHighlight(related) {
  const { incoming, same, outgoing } = related
  incoming.forEach(removeClass('incoming-highlight'))
  same.forEach(removeClass('same-highlight'))
  outgoing.forEach(removeClass('outgoing-highlight'))
}


function handleMouseEnter() {
  currentRelated.value = store.getRelated(props.pointer.term)
  loadOptions(currentRelated.value)
  highlightRelated(currentRelated.value)
}

function handleMouseLeave() {
  if (currentRelated.value) {
    removeHighlight(currentRelated.value)
  }
}



</script>

<template>
  <n-dropdown
      :options="menuOptions"
      placement="right"
      trigger="hover"
      @select="handleSelect"
  >
    <n-button
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >
      <slot></slot>
    </n-button>
  </n-dropdown>
</template>
<style>

.incoming-highlight {
  outline: 1px solid rgb(70, 56, 56);
}

.same-highlight {
  outline: 2px solid rgb(21, 51, 231);
}

.outgoing-highlight {
  outline: 1px solid rgb(70, 56, 56);
}

</style>
