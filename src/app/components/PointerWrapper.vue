<script setup>
import { NDropdown } from 'naive-ui'
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

function safeGetTermIds (term) {
  try {
    const result = store.getTermIds(term)
    return Array.isArray(result) ? result : []
  } catch {
    return []
  }
}

function termToDropdown (term, myId) {
  const ids = safeGetTermIds(term)
  return ids.map(id => ({
    label: id === myId ? `${id} (current)` : id,
    key: `entity-${id}`,
  }))
}

function loadOptions ({ incomingTerms = [], outgoingTerms = [], graphs = [] }) {
  const myId = props.pointer?.id
  const options = []

  const buildTermSection = (terms, label) => ({
    label: `${label} (${terms.length})`,
    key: label,
    children: terms.map(term => ({
      label: term?.value || '[unknown]',
      key: `term-${term?.value}`,
      children: termToDropdown(term, myId),
    })),
  })

  if (outgoingTerms.length) options.push(buildTermSection(outgoingTerms, 'outgoing'))
  if (incomingTerms.length) options.push(buildTermSection(incomingTerms, 'incoming'))

  const same = safeGetTermIds(props.pointer?.term)
  const _same = same.filter(id => id !== myId)
  if (_same.length) {
    options.push({
      label: `🔗 (${_same.length})`,
      key: 'same',
      children: termToDropdown(props.pointer.term, myId),
    })
  }

  if (graphs.length > 1) {
    options.push({ type: 'divider', key: 'divider' })
    options.push({
      label: `G (${graphs.length})`,
      key: 'graphs',
      children: graphs.map(g => ({
        label: g.value || 'Default',
        key: `graph-${g.value || 'default'}`,
      })),
    })
  }

  options.push({ label: 'select', key: 'select' })
  menuOptions.value = options
}

function handleSelect (key) {
  if (key.startsWith('entity-')) {
    const id = key.replace('entity-', '')
    goTo(id)
  } else if (key === 'select') {
    store.termFacet(props.pointer?.term)
  } else if (key.startsWith('graph-')) {
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
  const myId = props.pointer?.id
  const same = safeGetTermIds(props.pointer?.term)
  if (!myId || !same.length) return

  const sorted = [...same].sort()
  const currentIndex = sorted.indexOf(myId)
  const nextIndex = (currentIndex + 1) % sorted.length
  goTo(sorted[nextIndex])
}

function handleMouseEnter () {
  const term = props.pointer?.term
  if (!term) return
  currentRelated.value = store.getRelated(term)
  loadOptions(currentRelated.value)
  highlightRelated(term, currentRelated.value, store.getTermIds)
}

function handleMouseLeave () {
  const term = props.pointer?.term
  if (!term || !currentRelated.value) return
  removeHighlight(term, currentRelated.value, store.getTermIds)
}
</script>


<template>

  <n-dropdown
      :options="menuOptions"
      placement="right"
      trigger="hover"
      @select="handleSelect"
  >
    <div
        @click.prevent="handleMouseClick"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
    >

      <slot></slot>
    </div>

  </n-dropdown>
  <ToolIcon :term="toRaw(pointer.term)"/>
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
