<template>
  <div>
    <h1>🌳 RDF-Tree Vue.js component for visualizing RDF datasets</h1>


    <div v-if="error" class="error">
      {{ error }}
    </div>
    <div v-else-if="!rootPointer" class="loading">
      Creating sample RDF data...
    </div>
    <RdfTree
      v-else
      :pointer="rootPointer"
      :enableHighlighting="enableHighlighting"
      :enableRightClick="enableRightClick"
      :termComponent="useCustomTerm ? CustomTerm : null"
    />
    <!-- Configuration Demo Section -->
    <details class="config-demo">
      <summary>🛠️ Configuration Options Demo</summary>
      <div class="config-options">
        <h3>Test Configuration Options</h3>
        <label>
          <input type="checkbox" v-model="enableHighlighting" />
          Enable highlighting on hover
        </label>
        <label>
          <input type="checkbox" v-model="enableRightClick" />
          Enable right-click context menus
        </label>
        <label>
          <input type="checkbox" v-model="useCustomTerm" />
          Use custom term component (with badges and styling)
        </label>
        <p class="config-note">
          Toggle these options to test the component's configurable features. The custom term component shows a completely different visual approach with badges and context-based styling.
        </p>
      </div>
    </details>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RdfTree } from '../../src/index.js' // Direct relative import
import rdf from 'rdf-ext'
import grapoi from 'grapoi'
import CustomTerm from './CustomTerm.vue'

const rootPointer = ref(null)
const error = ref(null)
const enableHighlighting = ref(false)
const enableRightClick = ref(false)
const useCustomTerm = ref(true)

onMounted(async () => {
  try {
    // Create RDF dataset manually - no parser needed
    const dataset = rdf.dataset()

    // Create terms
    const alice = rdf.namedNode('http://example.org/alice')
    const bob = rdf.namedNode('http://example.org/bob')
    const charlie = rdf.namedNode('http://example.org/charlie')

    const rdfType = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
    const foafPerson = rdf.namedNode('http://xmlns.com/foaf/0.1/Person')
    const foafName = rdf.namedNode('http://xmlns.com/foaf/0.1/name')
    const foafAge = rdf.namedNode('http://xmlns.com/foaf/0.1/age')
    const foafKnows = rdf.namedNode('http://xmlns.com/foaf/0.1/knows')
    const xsdInteger = rdf.namedNode('http://www.w3.org/2001/XMLSchema#integer')

    // Add Alice's triples
    dataset.add(rdf.quad(alice, rdfType, foafPerson))
    dataset.add(rdf.quad(alice, foafName, rdf.literal('Alice Smith')))
    dataset.add(rdf.quad(alice, foafAge, rdf.literal('30', xsdInteger)))
    dataset.add(rdf.quad(alice, foafKnows, bob))
    dataset.add(rdf.quad(alice, foafKnows, charlie))

    // Add Bob's triples
    dataset.add(rdf.quad(bob, rdfType, foafPerson))
    dataset.add(rdf.quad(bob, foafName, rdf.literal('Bob Johnson')))
    dataset.add(rdf.quad(bob, foafAge, rdf.literal('25', xsdInteger)))
    dataset.add(rdf.quad(bob, foafKnows, alice))

    // Add Charlie's triples
    dataset.add(rdf.quad(charlie, rdfType, foafPerson))
    dataset.add(rdf.quad(charlie, foafName, rdf.literal('Charlie Brown')))
    dataset.add(rdf.quad(charlie, foafAge, rdf.literal('35', xsdInteger)))
    dataset.add(rdf.quad(charlie, foafKnows, alice))

    console.log('✅ Created sample RDF dataset with', dataset.size, 'triples')

    // Create grapoi pointer starting from Alice
    rootPointer.value = grapoi({ dataset, term: alice, factory: rdf })

    console.log('🎯 Root pointer created for:', alice.value)

  } catch (e) {
    error.value = `Failed to create demo: ${e.message}`
    console.error('Demo creation error:', e)
  }
})
</script>

<style>

</style>
