import { expect } from 'expect'
import toMatchSnapshot from 'expect-mocha-snapshot'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { getRelatedIds } from '../src/app/lookup.js'
import { getEntities } from '../src/traversers/entities.js'
import { getRabbitDataset } from './support/dataset.js'

expect.extend({ toMatchSnapshot })

describe('lookup', () => {

  it(`maps URIs to their corresponding IDs`, function () {
    const dataset = getRabbitDataset()
    const { uriToIds } = getEntities(dataset)
    expect(uriToIds).toMatchSnapshot(this)
  })

  it(`gets Related ids for an entity`, function () {
    const dataset = getRabbitDataset()
    const { uriToIds } = getEntities(dataset)
    const term = rdf.namedNode('http://example.org/note/Alice.md')
    const result = getRelatedIds(dataset, term, uriToIds)
    expect(result).toMatchSnapshot(this)
  })
})
