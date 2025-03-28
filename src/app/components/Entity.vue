<script setup>
import { ArrowUp } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { onMounted, ref, toRaw, inject, provide, computed } from 'vue'
import ToolIcon from './ToolIcon.vue'
import Row from './Row.vue'
import Term from './Term.vue'
import { getGraphBackgroundStyle, getAllTerms, getNewTerms } from './colors.js'

const props = defineProps({
  pointer: Object,
})

const inDataset = ref()

onMounted(() => {
  inDataset.value = !!document.getElementById(`${props.pointer.term.value}`)
})

// Inject parent graphs from higher up in the hierarchy
const parentGraphs = inject('parentGraphs', [])
const combinedGraphs = getAllTerms(parentGraphs, props.pointer.graphs)
provide('parentGraphs', combinedGraphs)

const newDeclarations = computed(() => {
  return getNewTerms(parentGraphs, props.pointer.graphs)
})

const entityStyle = computed(() => {
  return getGraphBackgroundStyle(newDeclarations.value)
})


</script>

<template>
  <template v-if="pointer.rows.length">

<!--    <ul>-->
<!--      <li>PARENT GRAPHS[{{ parentGraphs }}]</li>-->
<!--      <li>ELEMENT DECLARATIONS[{{ pointer.graphs }}]</li>-->
<!--      <li>NEW DECLARATIONS[{{ newDeclarations }}]</li>-->
<!--      <li>entityHeaderStyle[{{ entityStyle }}]</li>-->
<!--    </ul>-->

    <div class="entity" :id="pointer.term.value" :style="entityStyle">
      <div
          class="entity-header"

      >
        <Term :term="pointer.term">
          <ToolIcon :term="toRaw(pointer.term)"/>
        </Term>
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
<style scoped>
.entity,
.row-container {
  background-blend-mode: multiply;
  transition: background 0.3s ease;
}
</style>
