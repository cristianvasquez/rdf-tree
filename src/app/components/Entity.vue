<script setup>
import { computed, toRaw } from 'vue'
import { getBackgroundStyle } from './colors.js'
import PointerWrapper from './PointerWrapper.vue'
import Row from './Row.vue'
import Term from './Term.vue'

const props = defineProps({
  pointer: Object,
})

const entityStyle = computed(() => {
  const graphValues = (props.pointer.meta?.graphs ?? []).map(x => x.value)
  // return getBackgroundStyle(graphValues, true)
  return {}
})
</script>

<template>
  <div :id="pointer.id">
    <template v-if="pointer.rows.length">
      <!-- Entity with rows -->
      <div class="entity" :style="entityStyle">
        <div class="entity-header">
          <PointerWrapper :pointer="pointer">
            <Term :term="pointer.term"/>
          </PointerWrapper>
        </div>
        <div class="rows">
          <template v-for="row of pointer.rows">
            <Row :row="row">
              <Term :term="row.predicate"/>
            </Row>
          </template>
        </div>
      </div>
    </template>
    <template v-else>
      <PointerWrapper :pointer="pointer">
        <Term :term="pointer.term"/>
      </PointerWrapper>
    </template>
  </div>
</template>
