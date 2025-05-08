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


function buildTermSection(terms, label, myId) {
  return {
    label: `${label} (${terms.length})`,
    key: label,
    children: terms.map(term => {
      const termLabel = term?.value || '[unknown]';
      const ids = safeGetTermIds(term);

      // If there's only one ID, don't create a nested structure
      if (ids.length === 1) {
        const id = ids[0];
        return {
          label: `${termLabel} - ${id === myId ? `${id} (current)` : id}`,
          key: `entity-${id}`,
        };
      }

      // If multiple IDs, use the nested structure
      return {
        label: termLabel,
        key: `term-${termLabel}`,
        children: termToDropdown(term, myId),
      };
    }),
  };
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

  if (outgoingTerms.length) options.push(buildTermSection(outgoingTerms, 'outgoing', myId))
  if (incomingTerms.length) options.push(buildTermSection(incomingTerms, 'incoming', myId))

  const same = safeGetTermIds(props.pointer?.term)
  const _same = same.filter(id => id !== myId)
  if (_same.length) {
    options.push({
      label: `🔗 (${_same.length})`,
      key: 'same',
      children: termToDropdown(props.pointer.term, myId),
    })
  }

  if (graphs.length > 0) {
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

// TODO refactor
function handleSelect (key, option) {
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
      placement="bottom-start"
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
