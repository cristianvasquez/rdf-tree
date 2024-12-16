import grapoi from 'grapoi'
import rdf from 'rdf-ext'

class Entity {
  constructor (term) {
    this.term = term
    this.types = []
    this.rows = []
  }
}

const rdfType = rdf.namedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type')

const all = { subject: undefined, predicate: undefined, object: undefined }

// Gets the roots of all entities.
//
// matchers: array of matchers of the type {s,p,o}, where {} is all triples
// ignoreNamedGraphs: trims namedGraphs from the dataset
function getEntities (dataset, options) {

  const { matchers, ignoreNamedGraphs } = {
    matchers: [all],
    ignoreNamedGraphs: true, ...options,
  }

  const result = []

  let visited = rdf.termSet()

  const d = ignoreNamedGraphs ? dataset.map(
    quad => rdf.quad(quad.subject, quad.predicate, quad.object)) : dataset

  for (const { subject, predicate, object } of matchers) {
    const batch = [...d.match(subject, predicate, object)].map(
      x => x.subject).filter(x => !visited.has(x))

    const batchResult = batch.reduce((acc, term) => {

      if (acc.visited.has(term)) {
        // If it was visited, ignore it from batch
        return { entities: acc.entities, visited: acc.visited }
      }

      const pointer = grapoi({ dataset: d, term, factory: rdf })

      if (pointer.in().term) {
        // If there is another triple pointing to it, ignore it from batch
        return { entities: acc.entities, visited: acc.visited }
      }

      const { entity, visited } = bfsEntity(pointer, acc.visited)
      return {
        entities: acc.entities.concat(entity),
        visited,
      }
    }, { entities: [], visited })

    result.push(...batchResult.entities)
    visited = batchResult.visited
  }

  return result
}

function bfsEntity (pointer, visited = rdf.termSet()) {
  const entity = new Entity(pointer.term)

  entity.types = pointer.node(pointer.term).out(rdfType).terms
  const queue = [entity]

  while (queue.length > 0) {
    const entity = queue.shift()
    const term = entity.term

    if (visited.has(term)) {
      entity.isInternalLink = true
      continue
    }

    visited.add(term)

    const predicates = [
      ...rdf.termSet(
        [...pointer.node(term).out().quads()].map(x => x.predicate))]

    for (const predicate of predicates) {
      const values = pointer.node(term).out(predicate)

      const row = { predicate, values: [] }

      for (const value of values) {
        const childEntity = new Entity(value.term)

        childEntity.types = pointer.node(value.term).out(rdfType).terms
        row.values.push(childEntity)
        queue.push(childEntity)
      }

      entity.rows.push(row)
    }
  }

  return { entity, visited }
}

export { bfsEntity, getEntities }
