import rdf from 'rdf-ext'

function getRelatedIds (dataset, term, uriToIds) {
  const toIds = (term) => uriToIds.has(term) ? [...uriToIds.get(term)] : []

  // Track all graphs encountered
  const allGraphs = new Set()

  // Track which graphs each ID appears in
  const idToGraphs = new Map()

  // Helper to record ID-graph relationships
  const recordGraphs = (id, quad) => {
    const graph = quad.graph.value || 'default'
    allGraphs.add(graph)

    if (!idToGraphs.has(id)) {
      idToGraphs.set(id, new Set())
    }
    idToGraphs.get(id).add(graph)
  }

  // Process incoming relations
  const inTerms = rdf.termSet()
  const incoming = Array.from(new Set(
    [...dataset.match(null, null, term)].flatMap(quad => {
      const ids = toIds(quad.subject)
      inTerms.add(quad.subject)
      ids.forEach(id => recordGraphs(id, quad))
      return ids
    }),
  ))

  // Process same term
  const same = toIds(term)
  same.forEach(id => {
    // For "same" IDs, we need to look up what graphs they appear in
    const sameQuads = [
      ...dataset.match(term, null, null),
      ...dataset.match(null, null, term)]
    sameQuads.forEach(quad => {
      recordGraphs(id, quad)
    })
  })

  // Process outgoing relations
  const outTerms = rdf.termSet()
  const outgoing = Array.from(new Set(
    [...dataset.match(term, null, null)].flatMap(quad => {
      const ids = toIds(quad.object)
      outTerms.add(quad.object)
      ids.forEach(id => recordGraphs(id, quad))
      return ids
    }),
  ))

  // Convert Sets to Arrays in idToGraphs for easier consumption
  const idToGraphsArray = new Map()
  idToGraphs.forEach((graphs, id) => {
    idToGraphsArray.set(id, Array.from(graphs))
  })

  return {
    incoming,
    same,
    outgoing,
    incomingTerms: [...inTerms],
    outgoingTerms: [...outTerms],
    graphs: Array.from(allGraphs), // All encountered graphs
    idToGraphs: idToGraphsArray,    // Map of id -> graphs
  }
}

export { getRelatedIds }
