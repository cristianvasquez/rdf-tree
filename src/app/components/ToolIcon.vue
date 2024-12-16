<script setup>
import { NIcon } from 'naive-ui'
import { ScanOutline } from '@vicons/ionicons5'
import { useStore } from '../state.js'

const props = defineProps({
  filter: Object,
})
const store = useStore()

function focusOn ({ subject, predicate, object }) {
  store.setMatchers([
    { subject, predicate, object },
  ])
}

</script>

<template>
  <NIcon size="20" @click="()=>focusOn(filter)">
    <ScanOutline></ScanOutline>
  </NIcon>
</template>

