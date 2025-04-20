import { z } from 'zod'

// Define the schemas
const MetaSchema = z.object({
  types: z.array(z.any()),  // RDF term objects
  graphs: z.array(z.any()), // RDF term objects
})


const RowSchema = z.object({
  predicate: z.any(), // RDF term object
  values: z.array(z.lazy(() => EntitySchema)), // Recursive reference to EntitySchema
})


let lastId = 0
const getNextId = () => (++lastId).toString()


const EntitySchema = z.object({
  id: z.string().default(getNextId),
  term: z.any(), // RDF term object
  rows: z.array(RowSchema),
  meta: MetaSchema.optional(),
})

function createEntity (term, rows = []) {
  return EntitySchema.parse({
    term,
    rows,
  })
}

function createRow (predicate, values = []) {
  return RowSchema.parse({
    predicate,
    values,
  })
}

export { createEntity, createRow }
