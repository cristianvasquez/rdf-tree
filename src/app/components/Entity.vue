<script setup>
import { ArrowUp } from '@vicons/ionicons5'
import { NIcon } from 'naive-ui'
import { onMounted, ref, toRaw } from 'vue'
import ToolIcon from './ToolIcon.vue'
import Row from './Row.vue'
import Term from './Term.vue'

const props = defineProps({
  pointer: Object,
})
const inDataset = ref()

onMounted(() => {
  inDataset.value = !!document.getElementById(`${props.pointer.term.value}`)
})


</script>

<template>

  <template v-if="pointer.rows.length">
    <div class="entity" :id="pointer.term.value">
      <div class="entity-header">
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

