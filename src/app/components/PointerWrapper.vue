<script setup>
import { NDropdown, NButton } from 'naive-ui'
import { h, ref, toRaw } from 'vue'
import { useStore } from '../state.js'
import { getBackgroundStyle } from './colors.js'
import ToolIcon from './ToolIcon.vue'

const props = defineProps({
  pointer: Object,
})

const store = useStore()
const menuOptions = ref([])
const currentRelated = ref(null)

function loadOptions ({ incoming, same, outgoing, incomingTerms, outgoingTerms, graphs }) {
  const myId = props.pointer.id
  const options = []

  // const termChildren = (term) =>
  //     [
  //       {
  //         type: 'divider',
  //         key: 'divider',
  //       },
  //       ...store.getTermIds(term).flatMap(id => ({
  //         label: id === myId ? `${id} (current)` : `${id}`,
  //         key: `entity-${id}`,
  //       })),
  //     ]
  //
  // if (outgoingTerms.length) {
  //   options.push({
  //         label: `(${outgoingTerms.length}) ➡️`,
  //         key: 'outgoing',
  //         children: outgoingTerms.flatMap(termChildren),
  //       },
  //   )
  // }

  if (outgoingTerms.length) {
    options.push({
      label: `(${outgoingTerms.length}) ➡️`,
      key: 'outgoing',
      children: outgoingTerms.map(term => ({
        label: term.value,
        key: `term-${term.value}`,
        children: store.getTermIds(term).map(id => ({
          label: id === myId ? `${id} (current)` : `${id}`,
          key: `entity-${id}`,
        }))
      }))
    })
  }

  if (incomingTerms.length) {
    options.push({
      label: `➡️ (${incomingTerms.length})`,
      key: 'incoming',
      children: incomingTerms.map(term => ({
        label: term.value,
        key: `term-${term.value}`,
        children: store.getTermIds(term).map(id => ({
          label: id === myId ? `${id} (current)` : `${id}`,
          key: `entity-${id}`,
        }))
      }))
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

  if (graphs?.length) {
    options.push({
      type: 'divider',
      key: 'divider',
    })
    options.push({
      label: `G (${graphs.length})`,
      key: 'graphs',
      children: graphs.map(graph => ({
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
  const { incoming, same, outgoing, idToGraphs } = related

  const applyHighlight = (relationClass) => (id) => {
    const element = document.getElementById(id)
    if (element) {
      // Add border highlight class
      element.classList.add(`${relationClass}-highlight`)

      // Apply graph background if available
      if (idToGraphs && idToGraphs.has(id)) {
        const graphValues = idToGraphs.get(id)
        const backgroundStyle = getBackgroundStyle(graphValues, false)

        // Apply all style properties from backgroundStyle to the element
        Object.assign(element.style, {
          // Store original background to restore later
          '--original-background': element.style.background || 'transparent',
          '--original-backgroundImage': element.style.backgroundImage || 'none',
          // Apply new background
          ...backgroundStyle,
        })

        // Add a data attribute to track which elements have had backgrounds applied
        element.setAttribute('data-highlighted-graphs', 'true')
      }
    }
  }

  incoming.forEach(applyHighlight('incoming'))
  same.forEach(applyHighlight('same'))
  outgoing.forEach(applyHighlight('outgoing'))
}

function removeHighlight (related) {
  const { incoming, same, outgoing } = related

  const removeHighlighting = (relationClass) => (id) => {
    const element = document.getElementById(id)
    if (element) {
      // Remove border highlight class
      element.classList.remove(`${relationClass}-highlight`)

      // Restore original background if we applied graph highlighting
      if (element.getAttribute('data-highlighted-graphs') === 'true') {
        // Restore original background
        element.style.background = element.style.getPropertyValue('--original-background') || ''
        element.style.backgroundImage = element.style.getPropertyValue('--original-backgroundImage') || ''

        // Clean up custom properties
        element.style.removeProperty('--original-background')
        element.style.removeProperty('--original-backgroundImage')
        element.style.isolation = ''

        // Remove tracking attribute
        element.removeAttribute('data-highlighted-graphs')
      }
    }
  }

  incoming.forEach(removeHighlighting('incoming'))
  same.forEach(removeHighlighting('same'))
  outgoing.forEach(removeHighlighting('outgoing'))
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
