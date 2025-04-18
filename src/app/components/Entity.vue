<script setup>
import { computed, toRaw } from 'vue'
import { useStore } from '../state.js'
import { getBackgroundStyle } from './colors.js'
import EntityHover from './EntityHover.vue'
import Row from './Row.vue'
import Term from './Term.vue'
import ToolIcon from './ToolIcon.vue'

const props = defineProps({
  pointer: Object,
})

const store = useStore()

const entityStyle = computed(() => {
  return getBackgroundStyle(props.pointer, true)
})

</script>


<template>
  <div :id="pointer.id">
    <template v-if="pointer.rows.length">
      <!-- Entity with rows -->
      <div class="entity" :style="entityStyle">
        <div class="entity-header">
          <EntityHover :pointer="pointer">
            <Term :term="pointer.term">
              <ToolIcon :term="toRaw(pointer.term)"/>
            </Term>
          </EntityHover>
          <slot></slot>
        </div>
        <div class="rows">
          <template v-for="row of pointer.rows">
            <Row :row="row">
              <ToolIcon :term="toRaw(row.predicate)"/>
            </Row>
          </template>
        </div>
      </div>
    </template>
    <template v-else>
      <EntityHover :pointer="pointer">
        <Term :term="pointer.term">
          <ToolIcon :term="toRaw(pointer.term)"/>
        </Term>
      </EntityHover>
    </template>
  </div>
</template>
