<script setup xmlns="http://www.w3.org/1999/html">
import { ChevronDown, ChevronForwardOutline } from '@vicons/ionicons5'

import { NIcon } from 'naive-ui'
import { ref, inject, computed } from 'vue'
import Entity from './Entity.vue'

const props = defineProps({
  row: Object,
})

const show = ref(true)

// Inject CSS classifier function
const cssClassifierRef = inject('cssClassifier', ref(null))

// Compute CSS prefix for this row
const rowCssPrefix = computed(() => {
  const classifier = cssClassifierRef.value
  
  // Try to get prefix from classifier
  if (classifier && props.row) {
    return classifier(props.row, {
      predicate: props.row.predicate,
      values: props.row.values
    })
  }
  
  return null
})

// Compute CSS classes for row elements
const rowClasses = computed(() => {
  const prefix = rowCssPrefix.value
  return prefix ? `${prefix}-row` : ''
})

const propertyClasses = computed(() => {
  const prefix = rowCssPrefix.value
  return prefix ? `${prefix}-property` : ''
})

const valueClasses = computed(() => {
  const prefix = rowCssPrefix.value
  return prefix ? `${prefix}-value` : ''
})

function toggle () {
  show.value = !show.value
}

</script>
<template>
  <div class="row" :class="rowClasses">
    <ul class="property" :class="propertyClasses">
      <li>
        <div style="display: flex; align-items: center">
          <template v-if="row.values.length > 1">
            <template v-if="show">
              <NIcon @click="toggle">
                <ChevronDown/>
              </NIcon>
            </template>
            <template v-else>
              <NIcon @click="toggle">
                <ChevronForwardOutline/>
              </NIcon>
            </template>
          </template>
          <slot></slot>
        </div>
      </li>
    </ul>
    <ul class="value" :class="valueClasses">
      <template v-if="show">
        <li v-for="v of row.values">
          <Entity :pointer="v" :incomingProperty="row.predicate"/>
        </li>
      </template>
      <template v-else>
        <li>({{ row.values.length }})</li>
      </template>
    </ul>
  </div>
</template>
