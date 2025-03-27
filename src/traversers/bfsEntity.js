import rdf from 'rdf-ext'

class Entity {
  constructor (term) {
    this.term = term
    this.rows = []
  }
}

const unique = (arr) => [...rdf.termSet(arr)]

function bfsEntity (pointer, { visited, maxDepth }) {
  const entity = new Entity(pointer.term)

  const queue = [{ entity, depth: 0 }]

  while (queue.length > 0) {
    const { entity: currentEntity, depth } = queue.shift()
    const term = currentEntity.term

    if (visited.has(term)) {
      currentEntity.isInternalLink = true
      continue
    }

    visited.add(term)
    const outgoingQuads = [...pointer.node(term).out().quads()]

    for (const predicate of unique(outgoingQuads.map(x => x.predicate))) {
      const terms = pointer.node(term).out(predicate).terms

      const row = { predicate, values: [] }

      for (const term of unique(terms)) {
        const childEntity = new Entity(term)
        row.values.push(childEntity)
        if (depth + 1 < maxDepth) {
          queue.push({ entity: childEntity, depth: depth + 1 })
        }
      }

      currentEntity.rows.push(row)
    }
  }

  return { entity, visited }
}

export { bfsEntity }
