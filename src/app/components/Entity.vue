<script setup>
import PointerWrapper from './PointerWrapper.vue'
import Row from './Row.vue'
import Term from './Term.vue'

const props = defineProps({
  pointer: Object,
})


</script>

<template>
  <div :id="pointer.id">
    <template v-if="pointer.rows.length">
      <!-- Entity with rows -->
      <div class="entity">
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
