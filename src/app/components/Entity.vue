<script setup>
import { computed, toRaw } from 'vue'
import { getBackgroundStyle } from './colors.js'
import EntityMenu from './EntityMenu.vue'
import Row from './Row.vue'
import Term from './Term.vue'
import ToolIcon from './ToolIcon.vue'

const props = defineProps({
  pointer: Object,
})

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
          <EntityMenu :pointer="pointer">
            <Term :term="pointer.term">
              <ToolIcon :term="toRaw(pointer.term)"/>
            </Term>
          </EntityMenu>
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
      <EntityMenu :pointer="pointer">
        <Term :term="pointer.term">
          <ToolIcon :term="toRaw(pointer.term)"/>
        </Term>
      </EntityMenu>
    </template>
  </div>
</template>
