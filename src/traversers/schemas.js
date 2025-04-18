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

const EntitySchema = z.object({
  id: z.string().
    default(() => (EntitySchema._lastId = (EntitySchema._lastId || 0) +
      1).toString()),
  term: z.any(), // RDF term object
  rows: z.array(RowSchema),
  meta: MetaSchema.optional(),
})

// Helper function to create an entity
function createEntity (term) {
  return EntitySchema.parse({
    term,
    rows: [],
  })
}

export { createEntity }
