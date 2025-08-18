<script setup>
import { NIcon } from 'naive-ui'
import { ScanOutline, CheckmarkOutline } from '@vicons/ionicons5'
import { inject } from 'vue'

const props = defineProps({
  term: Object,
})
const store = inject('rdfStore')
const { currentFocus } = store
</script>

<template>
  <template v-if="currentFocus && currentFocus.equals(term)">
    <NIcon size="30" style="color: green;" @click="store.defaultFacet()">
      <CheckmarkOutline/>
    </NIcon>
  </template>
  <template v-else>
    <!--    <NIcon size="20" @click="()=>focusOn(term)">-->
    <!--      <ScanOutline></ScanOutline>-->
    <!--    </NIcon>-->
  </template>
</template>

