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

  // Changed from termSet to termMap for the URI -> ID mapping
  let visited = rdf.termMap()

  for (const { subject, predicate, object, graph } of matchers) {
    const batch = [...dataset.match(subject, predicate, object, graph)].map(
      x => x.subject).filter(subject => !visited.has(subject))

    const batchResult = batch.reduce((acc, term) => {

      if (acc.visited.has(term)) {
        // If it was visited, ignore it from the batch
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

  // Return both the entities and the visited map for URI -> ID mapping
  return { entities: result, uriToIds: visited }
}

export { getEntities }
