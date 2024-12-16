<script setup>
import { NIcon } from 'naive-ui'
import { ScanOutline, CheckmarkOutline } from '@vicons/ionicons5'
import { storeToRefs } from 'pinia'
import { useStore } from '../state.js'

const props = defineProps({
  term: Object,
})
const store = useStore()
const { currentFocus } = storeToRefs(store)

function focusOn (term) {
  store.focusOn(term)
}

</script>

<template>
  <template v-if="currentFocus && currentFocus.equals(term)">
    <NIcon size="30" style="color: green;" @click="store.reset()">
      <CheckmarkOutline />
    </NIcon>
  </template>
  <template v-else>
    <NIcon size="20" @click="()=>focusOn(term)">
      <ScanOutline></ScanOutline>
    </NIcon>
  </template>
</template>

