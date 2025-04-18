import grapoi from 'grapoi'
import rdf from 'rdf-ext'
import { bfsEntity } from './bfsEntity.js'

const all = { subject: undefined, predicate: undefined, object: undefined }

// Gets the roots of all entities.
//
// matchers: array of matchers of the type {s,p,o}, where {} is all triples
// maxDepth: max depth of the traversal
function getEntities (dataset, options) {

  const { matchers, asTriples, maxDepth } = {
    matchers: [all],
    maxDepth: Infinity,
    ...options,
  }

  const result = []

  let visited = rdf.termSet()

  for (const { subject, predicate, object } of matchers) {
    const batch = [...dataset.match(subject, predicate, object)].map(
      x => x.subject).filter(subject => !visited.has(subject))

    const batchResult = batch.reduce((acc, term) => {

      if (acc.visited.has(term)) {
        // If it was visited, ignore it from batch
        return { entities: acc.entities, visited: acc.visited }
      }

      const pointer = grapoi({ dataset, term, factory: rdf })

      const { entity, visited } = bfsEntity(pointer, {
        maxDepth,
        visited: acc.visited,
      })
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

export { getEntities }
