<template>
  <div style="padding: 20px;">
    <h1>RDF-Tree Development</h1>
    <p>Component library with sample data</p>
    
    <div v-if="error" style="color: red; padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px; margin: 1rem 0;">
      {{ error }}
    </div>
    
    <div v-else-if="!rootPointer" style="text-align: center; color: #7f8c8d; padding: 2rem;">
      Creating sample RDF data...
    </div>
    
    <RdfTree v-else :pointer="rootPointer" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RdfTree from '../src/app/App.vue'
import rdf from 'rdf-ext'
import grapoi from 'grapoi'

const rootPointer = ref(null)
const error = ref(null)

onMounted(async () => {
  try {
    // Create RDF dataset manually with rdf-ext
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
    
    console.log('✅ Created dataset with', dataset.size, 'triples')
    
    // Create grapoi pointer starting from Alice
    rootPointer.value = grapoi({ dataset, term: alice, factory: rdf })
    
    console.log('✅ Dev mode: Created pointer for', alice.value)
    
  } catch (e) {
    error.value = `Failed to create sample data: ${e.message}`
    console.error('Dev mode error:', e)
  }
})
</script>

<style>
/* Component styles will be included automatically */
</style>