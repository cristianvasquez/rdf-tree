import rdf from 'rdf-ext'

function createMeta (pointer) {
  const rdfType = rdf.namedNode(
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')
  const types = rdf.termSet()
  for (const quad of pointer.out().quads()) {
    if (quad.predicate.equals(rdfType)) {
      types.add(quad.object)
    }
  }
  return {
    types: [...types],
  }
}

export { createMeta }
