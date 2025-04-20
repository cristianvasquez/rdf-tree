import rdf from 'rdf-ext'

function getRelatedTerms (dataset, term) {

  // Track all graphs encountered
  const allGraphs = rdf.termSet()

  // Track which graphs each ID appears in
  const termToGraphs = rdf.termMap()

  // Helper to record ID-graph relationships
  const recordGraphs = (term, { graph }) => {
    // if (graph?.value) {
      allGraphs.add(graph)
      if (!termToGraphs.has(term)) {
        termToGraphs.set(term, rdf.termSet())
      }
      termToGraphs.get(term).add(graph)
    // }
  }

  const inTerms = rdf.termSet()
  for (const quad of dataset.match(null, null, term)) {
    inTerms.add(quad.subject)
    recordGraphs(quad.subject, quad)
  }
  const outTerms = rdf.termSet()
  for (const quad of dataset.match(term, null, null)) {
    outTerms.add(quad.object)
    recordGraphs(quad.object, quad)
  }

  termToGraphs.set(term, allGraphs)

  return {
    incomingTerms: [...inTerms],
    outgoingTerms: [...outTerms],
    graphs: Array.from(allGraphs), // All found graphs
    termToGraphs, // Map of term -> Set of graphs Set
  }
}

export { getRelatedTerms }
