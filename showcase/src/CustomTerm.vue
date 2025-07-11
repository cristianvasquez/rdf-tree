<script setup>
import { computed } from 'vue'

const props = defineProps({
  term: {
    type: Object,
    required: true
  },
  pointer: {
    type: Object,
    default: null
  },
  row: {
    type: Object,
    default: null
  },
  context: {
    type: String,
    default: 'unknown' // 'subject', 'predicate', 'object'
  }
})

// Custom logic - completely different from the original Term.vue
const termDisplay = computed(() => {
  if (props.term.termType === 'NamedNode') {
    // Extract just the fragment or last part of URI
    const uri = props.term.value
    const fragment = uri.includes('#') ? uri.split('#').pop() : uri.split('/').pop()
    return {
      type: 'uri',
      short: fragment,
      full: uri,
      isExternal: !uri.includes('example.org')
    }
  } else if (props.term.termType === 'Literal') {
    return {
      type: 'literal',
      value: props.term.value,
      datatype: props.term.datatype?.value,
      language: props.term.language
    }
  } else if (props.term.termType === 'BlankNode') {
    return {
      type: 'blank',
      id: props.term.value
    }
  }
  return { type: 'unknown', value: String(props.term.value) }
})

const contextStyle = computed(() => {
  switch (props.context) {
    case 'subject':
      return 'custom-term--subject'
    case 'predicate':
      return 'custom-term--predicate'
    case 'object':
      return 'custom-term--object'
    default:
      return 'custom-term--default'
  }
})
</script>

<template>
  <div class="custom-term" :class="contextStyle">
    <!-- URI display -->
    <template v-if="termDisplay.type === 'uri'">
      <div class="custom-term__container">
        <span
          class="custom-term__badge"
          :class="{ 'custom-term__badge--external': termDisplay.isExternal }"
        >
          {{ termDisplay.isExternal ? 'EXT' : 'LOC' }}
        </span>
        <a
          :href="termDisplay.full"
          class="custom-term__link"
          target="_blank"
          :title="termDisplay.full"
        >
          {{ termDisplay.short }}
        </a>
      </div>
    </template>

    <!-- Literal display -->
    <template v-else-if="termDisplay.type === 'literal'">
      <div class="custom-term__container">
        <span class="custom-term__badge custom-term__badge--literal">LIT</span>
        <span class="custom-term__value">{{ termDisplay.value }}</span>
        <span v-if="termDisplay.language" class="custom-term__lang">@{{ termDisplay.language }}</span>
        <span v-if="termDisplay.datatype && !termDisplay.datatype.includes('string')" class="custom-term__datatype">
          ^^{{ termDisplay.datatype.split('#').pop() }}
        </span>
      </div>
    </template>

    <!-- Blank node display -->
    <template v-else-if="termDisplay.type === 'blank'">
      <div class="custom-term__container">
        <span class="custom-term__badge custom-term__badge--blank">BLK</span>
        <span class="custom-term__blank">_:{{ termDisplay.id }}</span>
      </div>
    </template>

    <!-- Unknown display -->
    <template v-else>
      <div class="custom-term__container">
        <span class="custom-term__badge custom-term__badge--unknown">???</span>
        <span>{{ termDisplay.value }}</span>
      </div>
    </template>
  </div>
</template>

<style scoped>
.custom-term {
  display: inline-block;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.custom-term__container {
  display: flex;
  align-items: center;
  gap: 6px;
}

.custom-term__badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.7em;
  font-weight: bold;
  text-transform: uppercase;
}

.custom-term__badge--external {
  background: #ff6b6b;
  color: white;
}

.custom-term__badge:not(.custom-term__badge--external) {
  background: #4ecdc4;
  color: white;
}

.custom-term__badge--literal {
  background: #45b7d1;
  color: white;
}

.custom-term__badge--blank {
  background: #f9ca24;
  color: #2f3640;
}

.custom-term__badge--unknown {
  background: #6c5ce7;
  color: white;
}

.custom-term__link {
  color: #2f3640;
  text-decoration: none;
  font-weight: 500;
  border-bottom: 1px dotted #a4b0be;
}

.custom-term__link:hover {
  color: #4834d4;
  border-bottom-style: solid;
}

.custom-term__value {
  font-weight: 500;
  color: #2f3640;
}

.custom-term__lang {
  font-size: 0.8em;
  color: #ff9ff3;
  font-style: italic;
}

.custom-term__datatype {
  font-size: 0.8em;
  color: #54a0ff;
  font-style: italic;
}

.custom-term__blank {
  font-style: italic;
  color: #5f27cd;
}

/* Context-specific styling */
.custom-term--subject {
  border-left: 3px solid #00d2d3;
  padding-left: 8px;
}

.custom-term--predicate {
  border-left: 3px solid #ff9f43;
  padding-left: 8px;
}

.custom-term--object {
  border-left: 3px solid #7bed9f;
  padding-left: 8px;
}
</style>
