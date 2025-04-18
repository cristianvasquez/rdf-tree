<script setup>
import { NPopover } from 'naive-ui'
import { computed } from 'vue'
import { useStore } from '../state.js'

const props = defineProps({
  pointer: Object,
})

const store = useStore()
const relatedEntities = computed(() => {
  return store.getIdsForTerm(props.pointer.term).filter(id => id !== props.pointer.id)
})

function scrollToElement (id, event) {
  event.preventDefault()
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // Add highlight class
    element.classList.add('scrolled-to')
    // Remove it after animation
    setTimeout(() => {
      element.classList.remove('scrolled-to')
    }, 2000)
  } else {
    console.warn(`Element with id ${id} not found`)
  }
}
</script>

<template>
  <n-popover trigger="hover" :delay="500">
    <template #trigger>
      <slot></slot>
    </template>
    <span>
    <template v-if="pointer.meta">
      <template v-if="pointer.meta.graphs">
      Graphs
      <ul>
        <li v-for="graph of pointer.meta.graphs">{{ graph }}</li>
      </ul>
      </template>
      <template v-if="pointer.meta.types">
      Types
      <ul>
        <li v-for="type of pointer.meta.types">{{ type }}</li>
      </ul>
      </template>
    </template>
    <template v-if="relatedEntities.length">
      Related entities:
      <ul>
        <li v-for="id of relatedEntities" :key="id">
          <a href="#" @click="(e) => scrollToElement(id, e)">{{ id }}</a>
        </li>
      </ul>
    </template>
  </span>
  </n-popover>
</template>

