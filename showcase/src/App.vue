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
      :cssClassifier="cssClassifier"
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
        <label>
          <input type="checkbox" v-model="useVerticalLayout" />
          Enable property + object CSS classification demo
        </label>
        <p class="config-note">
          Toggle these options to test the component's configurable features. The CSS classifier demo shows both property-based styling (purple likes lists for ex:likes values) and object-based styling (orange cards for Address entities).
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
const useVerticalLayout = ref(true)

// CSS classifier function to demonstrate custom row styling
const cssClassifier = (row, context = {}) => {
  // Only apply classifier if vertical layout is enabled
  if (!useVerticalLayout.value) return null

  // Property-based classification: Check the predicate of this row
  if (row.predicate?.value === 'http://example.org/likes') {
    return 'likes'
  }

  // Object-based classification: Check if any of the values are Address entities
  if (row.values?.some(value => 
    value.meta?.types?.some(type => type.value === 'http://schema.org/Address') ||
    value.term?.value?.includes('address')
  )) {
    return 'address'
  }

  return null
}

onMounted(async () => {
  try {
    // Create RDF dataset manually - no parser needed
    const dataset = rdf.dataset()

    // Create terms
    const alice = rdf.namedNode('http://example.org/alice')
    const bob = rdf.namedNode('http://example.org/bob')
    const charlie = rdf.namedNode('http://example.org/charlie')
    const bobAddress = rdf.namedNode('http://example.org/bob-address')

    const rdfType = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
    const foafPerson = rdf.namedNode('http://xmlns.com/foaf/0.1/Person')
    const foafName = rdf.namedNode('http://xmlns.com/foaf/0.1/name')
    const foafAge = rdf.namedNode('http://xmlns.com/foaf/0.1/age')
    const foafKnows = rdf.namedNode('http://xmlns.com/foaf/0.1/knows')
    const exLikes = rdf.namedNode('http://example.org/likes')
    const xsdInteger = rdf.namedNode('http://www.w3.org/2001/XMLSchema#integer')

    // Alice's interests
    const icecream = rdf.namedNode('http://example.org/icecream')
    const sunsets = rdf.namedNode('http://example.org/sunsets')
    const movies = rdf.namedNode('http://example.org/movies')

    // Address-related terms
    const schemaAddress = rdf.namedNode('http://schema.org/Address')
    const schemaAddressProp = rdf.namedNode('http://schema.org/address')
    const schemaStreetAddress = rdf.namedNode('http://schema.org/streetAddress')
    const schemaAddressLocality = rdf.namedNode('http://schema.org/addressLocality')
    const schemaPostalCode = rdf.namedNode('http://schema.org/postalCode')

    // Add Alice's triples
    dataset.add(rdf.quad(alice, rdfType, foafPerson))
    dataset.add(rdf.quad(alice, foafName, rdf.literal('Alice Smith')))
    dataset.add(rdf.quad(alice, foafAge, rdf.literal('30', xsdInteger)))
    dataset.add(rdf.quad(alice, foafKnows, bob))
    dataset.add(rdf.quad(alice, foafKnows, charlie))
    dataset.add(rdf.quad(alice, exLikes, icecream))
    dataset.add(rdf.quad(alice, exLikes, sunsets))
    dataset.add(rdf.quad(alice, exLikes, movies))

    // Add Bob's triples
    dataset.add(rdf.quad(bob, rdfType, foafPerson))
    dataset.add(rdf.quad(bob, foafName, rdf.literal('Bob Johnson')))
    dataset.add(rdf.quad(bob, foafAge, rdf.literal('25', xsdInteger)))
    dataset.add(rdf.quad(bob, foafKnows, alice))
    dataset.add(rdf.quad(bob, schemaAddressProp, bobAddress))

    // Add Bob's Address entity
    dataset.add(rdf.quad(bobAddress, rdfType, schemaAddress))
    dataset.add(rdf.quad(bobAddress, schemaStreetAddress, rdf.literal('123 Main Street')))
    dataset.add(rdf.quad(bobAddress, schemaAddressLocality, rdf.literal('New York')))
    dataset.add(rdf.quad(bobAddress, schemaPostalCode, rdf.literal('10001')))

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
/* CSS styles for row-level classification */
.likes-row {
  background-color: rgba(147, 51, 234, 0.1);
  border-left: 3px solid rgb(147, 51, 234);
}

.likes-property {
  background-color: rgba(147, 51, 234, 0.2);
  border-radius: 4px;
}

.likes-value {
  background-color: rgba(147, 51, 234, 0.05);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}

.address-row {
  background-color: rgba(251, 146, 60, 0.1);
  border-left: 3px solid rgb(251, 146, 60);
}

.address-property {
  background-color: rgba(251, 146, 60, 0.2);
  border-radius: 4px;
}

.address-value {
  background-color: rgba(251, 146, 60, 0.05);
}
</style>
