<script setup>
import { ArrowUp } from '@vicons/ionicons5'
import { NIcon, NPopover } from 'naive-ui'
import { computed, onMounted, ref, toRaw } from 'vue'
import { getBackgroundStyle } from './colors.js'
import Row from './Row.vue'
import Term from './Term.vue'
import ToolIcon from './ToolIcon.vue'

const props = defineProps({
  pointer: Object,
})

const inDataset = ref()

onMounted(() => {
  inDataset.value = !!document.getElementById(`${props.pointer.term.value}`)
})

const entityStyle = computed(() => {
  return getBackgroundStyle(props.pointer, true)
})

</script>

<template>
  <template v-if="pointer.rows.length">

    <div class="entity" :id="pointer.term.value" :style="entityStyle">
      <div
          class="entity-header"
      >
        <n-popover trigger="hover" :delay="500">
          <template #trigger>
            <Term :term="pointer.term">
              <ToolIcon :term="toRaw(pointer.term)"/>
            </Term>
          </template>
          <span>
            <template v-if="pointer.meta">
            Graphs
            <ul>
              <li v-for="graph of pointer.meta.graphs">{{ graph }}</li>
            </ul>
             types
            <ul>
              <li v-for="type of pointer.meta.types">{{ type }}</li>
            </ul>
            </template>

          </span>
        </n-popover>

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
    <template v-if="pointer.isInternalLink && inDataset">
      <a :href="`#${pointer.term.value}`">
        {{ pointer.term.value }}
        <NIcon>
          <ArrowUp/>
        </NIcon>
      </a>
    </template>
    <template v-else>
      <Term :term="pointer.term">
        <ToolIcon :term="toRaw(pointer.term)"/>
      </Term>
    </template>
  </template>
</template>
