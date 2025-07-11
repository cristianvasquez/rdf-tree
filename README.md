# rdf-tree

Vue.js 3 component library for visualizing RDF datasets in an interactive tree interface.

## Installation

```bash
npm install rdf-tree
```

## Usage in Vue Project

```javascript
import { createApp } from 'vue'
import { RdfTree } from 'rdf-tree'
import 'rdf-tree/dist/rdf-tree.css'
import rdf from 'rdf-ext'
import grapoi from 'grapoi'

const app = createApp(App)
app.component('RdfTree', RdfTree)
```

```vue
<template>
  <RdfTree 
    :pointer="rootPointer"
    :enable-highlighting="true"
    :enable-right-click="true"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'

const rootPointer = ref(null)

onMounted(async () => {
  // Create RDF dataset and grapoi pointer
  const dataset = rdf.dataset()
  // ... add your RDF data
  rootPointer.value = grapoi({ dataset, term: yourRootTerm, factory: rdf })
})
</script>
```

## Requirements

- Vue.js 3.5+
- Naive UI 2.40+ (peer dependency)
