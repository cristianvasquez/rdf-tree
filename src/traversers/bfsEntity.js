import rdf from 'rdf-ext'

class Entity {
  constructor (term) {
    this.term = term
    this.rows = []
  }
}
const unique = (arr) => [...rdf.termSet(arr)]

function bfsEntity (pointer, { visited = new Set(), maxDepth = Infinity }) {

  const rootEntity = new Entity(pointer.term)

  // Append graphs for the root entity (@TODO, refactor - make this optional)
  rootEntity.graphs = unique(
    [...pointer.out().quads()].map(x => x.graph),
  )

  // Queue for BFS traversal
  const queue = [{ entity: rootEntity, depth: 0 }]

  while (queue.length > 0) {
    const { entity: currentEntity, depth } = queue.shift()
    const term = currentEntity.term

    // Check for internal links
    if (visited.has(term)) {
      currentEntity.isInternalLink = true
      continue
    }

    visited.add(term)

    // Get outgoing quads for the current term
    const outgoingQuads = [...pointer.node(term).out().quads()]

    // Get unique outgoing predicates
    const outgoingPredicates = unique(outgoingQuads.map(x => x.predicate))

    for (const predicate of outgoingPredicates) {
      const terms = pointer.node(term).out(predicate).terms

      // Append graphs for the predicates (@TODO, refactor - make this optional)
      const predicateGraphs = unique(
        outgoingQuads.filter(x => x.predicate.equals(predicate)).
          map(x => x.graph),
      )

      // One row for each unique predicate
      const row = {
        predicate,
        values: [],
        graphs: predicateGraphs,
      }

      // Process unique terms for this predicate
      for (const term of unique(terms)) {
        const childEntity = new Entity(term)

        // Append graphs for the values (@TODO, refactor - make this optional)
        childEntity.graphs = unique(
          outgoingQuads.filter(x => x.object.equals(term)).map(x => x.graph),
        )

        row.values.push(childEntity)

        if (depth + 1 < maxDepth) {
          queue.push({ entity: childEntity, depth: depth + 1 })
        }
      }

      currentEntity.rows.push(row)
    }
  }

  return { entity: rootEntity, visited }
}

export { bfsEntity }
