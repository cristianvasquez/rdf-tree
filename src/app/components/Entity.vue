<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'
import PointerWrapper from './PointerWrapper.vue'
import Row from './Row.vue'
import Term from './Term.vue'

const props = defineProps({
  pointer: Object,
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

// Compute the actual term component to use
const TermComponent = computed(() => {
  return customTermComponentRef.value || Term
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
  <div :id="pointer.id" ref="entityRef">
    <template v-if="pointer.rows.length">
      <!-- Entity with rows -->
      <div class="entity">
        <div class="entity-header">
          <PointerWrapper :pointer="pointer">
            <component :is="TermComponent" :term="pointer.term" :pointer="pointer" context="subject"/>
          </PointerWrapper>
        </div>
        <div class="rows">
          <template v-for="row of pointer.rows">
            <Row :row="row">
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
