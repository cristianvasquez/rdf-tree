<script setup>
import { NDropdown, NButton } from 'naive-ui'
import { h, ref, toRaw } from 'vue'
import { useStore } from '../state.js'
import ToolIcon from './ToolIcon.vue'

const props = defineProps({
  pointer: Object,
})

const store = useStore()
const menuOptions = ref([])
const currentRelated = ref(null)

function loadOptions ({ incoming, same, outgoing }) {
  const myId = props.pointer.id
  const options = []

  if (outgoing.length) {
    options.push({
      label: `(${outgoing.length}) ➡️`,
      key: 'outgoing',
      children: outgoing.map(id => ({
        label: id === myId ? `${id} (current)` : `${id}`,
        key: `entity-${id}`,
      })),
    })
  }

  if (incoming.length) {
    options.push({
      label: `➡️ (${incoming.length})`,
      key: 'incoming',
      children: incoming.map(id => ({
        label: id === myId ? `${id} (current)` : `${id}`,
        key: `entity-${id}`,
      })),
    })
  }

  const _same = same.filter(id => id !== myId)
  if (_same.length) {
    options.push({
      label: `🔗 (${same.length})`,
      key: 'same',
      children: _same.map(id => ({
        label: id === myId ? `${id} (current)` : `${id}`,
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
    goTo(id)
  }

  if (key.startsWith('graph-')) {
    const id = key.replace('graph-', '')
    const graph = props.pointer.meta.graphs.find(x => x.value === id)
    console.log('select', graph)
  }
}

function goTo (id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    element.classList.add('scrolled-to')
    setTimeout(() => {
      element.classList.remove('scrolled-to')
    }, 2000)
  }
}

function highlightRelated (related) {
  const applyClass = (clazz) => (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.classList.add(clazz)
    }
  }

  const { incoming, same, outgoing } = related
  incoming.forEach(applyClass('incoming-highlight'))
  same.forEach(applyClass('same-highlight'))
  outgoing.forEach(applyClass('outgoing-highlight'))
}

function removeHighlight (related) {

  const removeClass = (clazz) => (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.classList.remove(clazz)
    }
  }

  const { incoming, same, outgoing } = related
  incoming.forEach(removeClass('incoming-highlight'))
  same.forEach(removeClass('same-highlight'))
  outgoing.forEach(removeClass('outgoing-highlight'))
}

function handleMouseClick () {
  if (currentRelated.value) {
    const { same } = currentRelated.value
    const myId = props.pointer.id
    const sorted = same.sort()
    const currentIndex = same.indexOf(myId)
    const nextIndex = currentIndex === sorted.length - 1 ? 0 : currentIndex + 1
    const id = sorted[nextIndex]
    goTo(id)
  }
}

function handleMouseEnter () {
  currentRelated.value = store.getRelated(props.pointer.term)
  loadOptions(currentRelated.value)
  highlightRelated(currentRelated.value)
}

function handleMouseLeave () {
  if (currentRelated.value) {
    removeHighlight(currentRelated.value)
  }
}


</script>

<template>
  <ToolIcon :term="toRaw(pointer.term)"/>
  <n-dropdown
      :options="menuOptions"
      placement="right"
      trigger="hover"
      @select="handleSelect"
  >
    <n-button
        @click.prevent="handleMouseClick"
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
