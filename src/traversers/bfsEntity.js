import rdf from 'rdf-ext'
import { createMeta } from './meta.js'
import { createEntity } from './schemas.js'

function bfsEntity (pointer, { visited = rdf.termMap(), maxDepth = Infinity }) {

  const rootEntity = createEntity(pointer.term)
  rootEntity.meta = createMeta(pointer)

  // Queue for BFS traversal
  const queue = [{ entity: rootEntity, depth: 0 }]

  while (queue.length > 0) {
    const { entity: currentEntity, depth } = queue.shift()
    const term = currentEntity.term

    // Check for internal links
    if (visited.has(term)) {
      // Add this entity's ID to the list for this term
      visited.get(term).push(currentEntity.id)
      continue
    }

    // Initialize the list of IDs for this term
    visited.set(term, [currentEntity.id])

    // Get outgoing quads for the current term
    const outgoingQuads = [...pointer.node(term).out().quads()]

    // Get unique outgoing predicates
    const outgoingPredicates = unique(outgoingQuads.map(x => x.predicate))

    for (const predicate of outgoingPredicates) {
      const terms = pointer.node(term).out(predicate).terms

      // One row for each unique predicate
      const row = {
        predicate,
        values: [],
      }

      // Process unique terms for this predicate
      for (const term of unique(terms)) {
        const childEntity = createEntity(term)

        childEntity.meta = createMeta(pointer.node(term))

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

const unique = (arr) => [...rdf.termSet(arr)]

export { bfsEntity }
