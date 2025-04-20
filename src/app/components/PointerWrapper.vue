<script setup>
import { NDropdown, NButton } from 'naive-ui'
import { h, ref, toRaw } from 'vue'
import { useStore } from '../state.js'
import { highlightRelated, removeHighlight } from './interaction/highlight.js'
import ToolIcon from './ToolIcon.vue'

const props = defineProps({
  pointer: Object,
})

const store = useStore()
const menuOptions = ref([])
const currentRelated = ref(null)

function loadOptions ({ incomingTerms, outgoingTerms, graphs }) {
  const myId = props.pointer.id
  const options = []

  if (outgoingTerms.length) {
    options.push({
      label: `🠖 (${outgoingTerms.length}) ➡️`,
      key: 'outgoing',
      children: outgoingTerms.map(term => ({
        label: term.value,
        key: `term-${term.value}`,
        children: store.getTermIds(term).map(id => ({
          label: id === myId ? `${id} (current)` : `${id}`,
          key: `entity-${id}`,
        })),
      })),
    })
  }

  if (incomingTerms.length) {
    options.push({
      label: `➡️ (${incomingTerms.length}) 🠖`,
      key: 'incoming',
      children: incomingTerms.map(term => ({
        label: term.value,
        key: `term-${term.value}`,
        children: store.getTermIds(term).map(id => ({
          label: id === myId ? `${id} (current)` : `${id}`,
          key: `entity-${id}`,
        })),
      })),
    })
  }

  const same = store.getTermIds(props.pointer.term)
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

  if (graphs?.length) {
    options.push({
      type: 'divider',
      key: 'divider',
    })
    options.push({
      label: `G (${graphs.length})`,
      key: 'graphs',
      children: graphs.map(x => x.value || 'Default').map(graph => ({
        label: graph,
        key: `graph-${graph}`,
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
    console.log('selected graph', id)
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

function handleMouseClick () {
  if (currentRelated.value) {
    const same = store.getTermIds(props.pointer.term)
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
  highlightRelated(props.pointer.term, currentRelated.value, store.getTermIds)
}

function handleMouseLeave () {
  if (currentRelated.value) {
    removeHighlight(props.pointer.term, currentRelated.value, store.getTermIds)
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
