<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'
import PointerWrapper from './PointerWrapper.vue'
import Row from './Row.vue'
import Term from './Term.vue'

const props = defineProps({
  pointer: Object,
  inheritedCssPrefix: {
    type: String,
    default: null,
  },
  incomingProperty: {
    type: Object,
    default: null,
  },
})

const entityRef = ref(null)

// Try to inject navigation composable (may not be available in all contexts)
const navigation = inject('entityNavigation', null)

// Inject custom term component (with fallback to default Term)
const customTermComponentRef = inject('termComponent', ref(null))

// Inject CSS classifier function
const cssClassifierRef = inject('cssClassifier', ref(null))

// Compute the actual term component to use
const TermComponent = computed(() => {
  return customTermComponentRef.value || Term
})

// Compute CSS prefix for this entity
const cssPrefix = computed(() => {
  const classifier = cssClassifierRef.value
  let ownPrefix = null
  
  // Try to get prefix from classifier
  if (classifier && props.pointer) {
    ownPrefix = classifier(props.pointer, {
      depth: 0,
      parentPrefix: props.inheritedCssPrefix,
      incomingProperty: props.incomingProperty
    })
  }
  
  // If entity has its own classification, use it
  // Otherwise, inherit from parent
  return ownPrefix || props.inheritedCssPrefix
})

// Compute CSS classes to apply
const entityClasses = computed(() => {
  const prefix = cssPrefix.value
  return prefix ? `${prefix}-entity` : ''
})

onMounted(() => {
  // Register this entity element with the navigation system
  if (navigation && props.pointer?.id && entityRef.value) {
    navigation.registerEntity(props.pointer.id, entityRef.value)
  }
})

onUnmounted(() => {
  // Unregister when component is destroyed
  if (navigation && props.pointer?.id) {
    navigation.unregisterEntity(props.pointer.id)
  }
})
</script>

<template>
  <div :id="pointer.id" ref="entityRef" :class="entityClasses">
    <template v-if="pointer.rows.length">
      <!-- Entity with rows -->
      <div class="entity" :class="cssPrefix ? `${cssPrefix}-entity-content` : ''">
        <div class="entity-header" :class="cssPrefix ? `${cssPrefix}-entity-header` : ''">
          <PointerWrapper :pointer="pointer">
            <component :is="TermComponent" :term="pointer.term" :pointer="pointer" context="subject"/>
          </PointerWrapper>
        </div>
        <div class="rows" :class="cssPrefix ? `${cssPrefix}-rows` : ''">
          <template v-for="row of pointer.rows">
            <Row :row="row" :inheritedCssPrefix="cssPrefix">
              <component :is="TermComponent" :term="row.predicate" :row="row" context="predicate"/>
            </Row>
          </template>
        </div>
      </div>
    </template>
    <template v-else>
      <PointerWrapper :pointer="pointer">
        <component :is="TermComponent" :term="pointer.term" :pointer="pointer" context="object"/>
      </PointerWrapper>
    </template>
  </div>
</template>
