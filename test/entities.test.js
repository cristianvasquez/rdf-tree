import { expect } from 'expect'
import toMatchSnapshot from 'expect-mocha-snapshot'
import { describe, it } from 'mocha'
import rdf from 'rdf-ext'
import { getEntities } from '../src/traversers/entities.js'
import { getRabbitDataset } from './support/dataset.js'

expect.extend({ toMatchSnapshot })

const ns = {
  ex: rdf.namespace('http://example.org/'),
  dot: rdf.namespace('http://pkm-united.org/'),
  rdf: rdf.namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#'),
}

describe('bfs', () => {
  it(`extracts ex:Something first`, function () {
    const dataset = getRabbitDataset()
    const options = {
      matchers: [
        {
          predicate: ns.rdf.type,
          object: ns.ex.Something,
        },
        {},
      ],
    }
    const { entities } = getEntities(dataset, options)
    expect(entities).toMatchSnapshot(this)
  })

  it(`extracts only alice graph`, function () {
    const dataset = getRabbitDataset()
    const options = {
      matchers: [
        {
          graph: rdf.namedNode('http://example.org/note/Alice.md'),
        },
      ],
    }
    const { entities } = getEntities(dataset, options)
    expect(entities).toMatchSnapshot(this)
  })

  it(`maxDepth = 2`, function () {
    const dataset = getRabbitDataset()
    const options = {
      maxDepth: 2,
    }
    const { entities } = getEntities(dataset, options)
    expect(entities).toMatchSnapshot(this)
  })

  it(`maps URIs to their corresponding IDs`, function () {
    const dataset = getRabbitDataset()
    const { uriToIds } = getEntities(dataset)
    expect(uriToIds).toMatchSnapshot(this)
  })
})
