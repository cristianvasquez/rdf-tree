<script setup>
import { NDropdown } from 'naive-ui'
import { computed, toRaw, ref } from 'vue'
import { useStore } from '../state.js'
import { useEntityNavigation } from '../composables/useEntityNavigation.js'
import { useDropdownMenu } from '../composables/useDropdownMenu.js'
import { useEntityHighlighting } from '../composables/useEntityHighlighting.js'
import ToolIcon from './ToolIcon.vue'

const props = defineProps({
  pointer: Object,
})

const store = useStore()

// Use composables for clean separation of concerns
const { scrollToEntity, cycleSameEntities, isScrollHighlighted } = useEntityNavigation(store)
const { menuOptions, updateMenu, clearMenu, parseMenuKey } = useDropdownMenu(store)
const { highlightRelated, removeAllHighlighting, getHighlightClasses } = useEntityHighlighting(store)

// Dropdown state
const showDropdown = ref(false)


// Compute CSS classes for this entity
const entityClasses = computed(() => {
  const classes = []
  
  // Add highlight classes
  if (props.pointer?.id) {
    classes.push(...getHighlightClasses(props.pointer.id))
  }
  
  // Add scroll highlight class
  if (props.pointer?.id && isScrollHighlighted(props.pointer.id)) {
    classes.push('scrolled-to')
  }
  
  return classes
})

function handleSelect(key, option) {
  const parsed = parseMenuKey(key)
  
  switch (parsed.type) {
    case 'entity':
      scrollToEntity(parsed.value)
      break
    case 'select':
      store.termFacet(props.pointer?.term)
      break
    case 'graph':
      console.log('selected graph', parsed.value)
      break
    default:
      console.warn('Unknown menu selection:', key)
  }
  
  // Close dropdown and clear menu after selection
  showDropdown.value = false
  clearMenu()
}

function handleMouseClick() {
  cycleSameEntities(props.pointer)
}

function handleMouseEnter() {
  const term = props.pointer?.term
  if (!term) return
  
  const related = store.getRelated(term)
  updateMenu(props.pointer, related)
  highlightRelated(term, related)
}

function handleMouseLeave() {
  const term = props.pointer?.term
  if (!term) return
  
  removeAllHighlighting()
  // Don't clear menu when using manual trigger - let clickoutside handle it
}

function handleRightClick() {
  const term = props.pointer?.term
  if (!term) return
  
  const related = store.getRelated(term)
  updateMenu(props.pointer, related)
  showDropdown.value = true
}

function handleClickOutside() {
  showDropdown.value = false
  clearMenu()
}
</script>


<template>
  <n-dropdown
    :options="menuOptions"
    placement="bottom-start"
    trigger="manual"
    :show="showDropdown"
    @select="handleSelect"
    @clickoutside="handleClickOutside"
  >
    <div
      :class="entityClasses"
      @click="handleMouseClick"
      @contextmenu.prevent="handleRightClick"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <slot></slot>
    </div>
  </n-dropdown>
  <ToolIcon :term="toRaw(pointer.term)"/>
</template>
