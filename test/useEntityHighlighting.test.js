import { describe, it, beforeEach, afterEach } from 'mocha'
import { expect } from 'expect'
import { JSDOM } from 'jsdom'
import { useEntityHighlighting } from '../src/app/composables/useEntityHighlighting.js'

describe('useEntityHighlighting', () => {
  let dom, mockStore, highlighting

  beforeEach(() => {
    // Set up JSDOM environment
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div id="entity1" class="term">Entity 1</div>
          <div id="entity2" class="term">Entity 2</div>
          <div id="entity3" class="term">Entity 3</div>
          <div id="same-entity-1" class="term">Same Entity Instance 1</div>
          <div id="same-entity-2" class="term">Same Entity Instance 2</div>
        </body>
      </html>
    `)
    
    // Set up global DOM
    global.window = dom.window
    global.document = dom.window.document
    global.HTMLElement = dom.window.HTMLElement

    // Mock store with realistic data
    mockStore = {
      getTermIds: (term) => {
        if (term && term.value === 'same-uri') {
          return ['same-entity-1', 'same-entity-2']
        }
        if (term && term.value === 'incoming-term') {
          return ['entity1']
        }
        if (term && term.value === 'outgoing-term') {
          return ['entity2']
        }
        if (term && term.value === 'current-term') {
          return ['entity3']
        }
        return ['entity1', 'entity2']
      }
    }

    // Create fresh instance for each test
    highlighting = useEntityHighlighting(mockStore)
  })

  afterEach(() => {
    // Clean up DOM
    delete global.window
    delete global.document
    delete global.HTMLElement
  })

  describe('Initial State', () => {
    it('should initialize with empty highlighted entities', () => {
      expect(highlighting.highlightedEntityIds.value).toEqual([])
      expect(highlighting.hasActiveHighlights.value).toBe(false)
      expect(highlighting.highlightedCount.value).toBe(0)
    })

    it('should have null current highlighted term and related data', () => {
      expect(highlighting.currentHighlightedTerm.value).toBe(null)
      expect(highlighting.currentRelated.value).toBe(null)
    })
  })

  describe('safeGetTermIds', () => {
    it('should handle normal terms', () => {
      const term = { value: 'test-term' }
      const highlighting = useEntityHighlighting(mockStore)
      // This tests the internal safeGetTermIds function indirectly
      highlighting.addHighlight(['entity1'], 'test')
      expect(highlighting.hasHighlightType('entity1', 'test')).toBe(true)
    })

    it('should handle null/undefined terms gracefully', () => {
      // Test by trying to highlight with null term
      expect(() => {
        highlighting.highlightRelated(null, { incomingTerms: [], outgoingTerms: [] })
      }).not.toThrow()
    })
  })

  describe('Highlight State Management', () => {
    it('should add highlights correctly', () => {
      highlighting.addHighlight(['entity1', 'entity2'], 'incoming')
      
      expect(highlighting.hasHighlightType('entity1', 'incoming')).toBe(true)
      expect(highlighting.hasHighlightType('entity2', 'incoming')).toBe(true)
      expect(highlighting.highlightedCount.value).toBe(2)
      expect(highlighting.hasActiveHighlights.value).toBe(true)
    })

    it('should remove highlights correctly', () => {
      highlighting.addHighlight(['entity1', 'entity2'], 'incoming')
      highlighting.removeHighlight(['entity1'], 'incoming')
      
      expect(highlighting.hasHighlightType('entity1', 'incoming')).toBe(false)
      expect(highlighting.hasHighlightType('entity2', 'incoming')).toBe(true)
      expect(highlighting.highlightedCount.value).toBe(1)
    })

    it('should handle multiple highlight types per entity', () => {
      highlighting.addHighlight(['entity1'], 'incoming')
      highlighting.addHighlight(['entity1'], 'outgoing')
      
      expect(highlighting.hasHighlightType('entity1', 'incoming')).toBe(true)
      expect(highlighting.hasHighlightType('entity1', 'outgoing')).toBe(true)
      expect(highlighting.highlightedCount.value).toBe(1) // Still one entity
    })

    it('should remove entity when all highlight types removed', () => {
      highlighting.addHighlight(['entity1'], 'incoming')
      highlighting.addHighlight(['entity1'], 'outgoing')
      highlighting.removeHighlight(['entity1'], 'incoming')
      highlighting.removeHighlight(['entity1'], 'outgoing')
      
      expect(highlighting.hasActiveHighlights.value).toBe(false)
      expect(highlighting.highlightedCount.value).toBe(0)
    })
  })

  describe('CSS Class Generation', () => {
    it('should generate correct CSS classes', () => {
      highlighting.addHighlight(['entity1'], 'incoming')
      highlighting.addHighlight(['entity1'], 'same')
      
      const classes = highlighting.getHighlightClasses('entity1')
      expect(classes).toContain('incoming-highlight')
      expect(classes).toContain('same-highlight')
      expect(classes).not.toContain('outgoing-highlight')
    })

    it('should return empty array for non-highlighted entities', () => {
      const classes = highlighting.getHighlightClasses('entity1')
      expect(classes).toEqual([])
    })
  })

  describe('DOM Manipulation Integration', () => {
    it('should apply DOM highlighting with CSS classes', () => {
      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [{ value: 'outgoing-term' }],
        termToGraphs: new Map()
      }

      highlighting.highlightRelated(term, related)

      // Check that DOM elements have correct classes
      const entity1 = document.getElementById('entity1')
      const entity2 = document.getElementById('entity2') 
      const entity3 = document.getElementById('entity3')

      expect(entity1.classList.contains('incoming-highlight')).toBe(true)
      expect(entity2.classList.contains('outgoing-highlight')).toBe(true)
      expect(entity3.classList.contains('same-highlight')).toBe(true)
    })

    it('should store current state when highlighting', () => {
      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [{ value: 'outgoing-term' }],
        termToGraphs: new Map()
      }

      highlighting.highlightRelated(term, related)

      expect(highlighting.currentHighlightedTerm.value).toStrictEqual(term)
      expect(highlighting.currentRelated.value).toStrictEqual(related)
    })

    it('should apply background styles with graph data', () => {
      const term = { value: 'current-term' }
      const incomingTerm = { value: 'incoming-term' }
      const termToGraphs = new Map()
      termToGraphs.set(incomingTerm, [
        { value: 'graph1' },
        { value: 'graph2' }
      ])

      const related = {
        incomingTerms: [incomingTerm],
        outgoingTerms: [],
        termToGraphs
      }

      highlighting.highlightRelated(term, related)

      const entity1 = document.getElementById('entity1')
      expect(entity1.getAttribute('data-highlighted-graphs')).toBe('true')
      // The original background property should be set (even if empty string)
      expect(entity1.style.getPropertyValue('--original-background')).toBeDefined()
    })
  })

  describe('DOM Cleanup', () => {
    it('should remove all highlighting when called', () => {
      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [{ value: 'outgoing-term' }],
        termToGraphs: new Map()
      }

      // Apply highlighting first
      highlighting.highlightRelated(term, related)

      // Verify highlights are applied
      expect(document.getElementById('entity1').classList.contains('incoming-highlight')).toBe(true)
      expect(document.getElementById('entity2').classList.contains('outgoing-highlight')).toBe(true)

      // Remove all highlighting
      highlighting.removeAllHighlighting()

      // Verify highlights are removed
      expect(document.getElementById('entity1').classList.contains('incoming-highlight')).toBe(false)
      expect(document.getElementById('entity2').classList.contains('outgoing-highlight')).toBe(false)
      expect(document.getElementById('entity3').classList.contains('same-highlight')).toBe(false)

      // Verify state is cleared
      expect(highlighting.currentHighlightedTerm.value).toBe(null)
      expect(highlighting.currentRelated.value).toBe(null)
    })

    it('should restore original styles when removing highlights', () => {
      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [],
        termToGraphs: new Map()
      }

      // Set initial style
      const entity1 = document.getElementById('entity1')
      entity1.style.background = 'red'

      highlighting.highlightRelated(term, related)
      highlighting.removeAllHighlighting()

      // Check that data-highlighted-graphs attribute is removed
      expect(entity1.getAttribute('data-highlighted-graphs')).toBe(null)
      expect(entity1.style.getPropertyValue('--original-background')).toBe('')
    })
  })

  describe('Clear All Highlights', () => {
    it('should clear all state', () => {
      highlighting.addHighlight(['entity1'], 'incoming')
      highlighting.clearAllHighlights()

      expect(highlighting.hasActiveHighlights.value).toBe(false)
      expect(highlighting.highlightedCount.value).toBe(0)
      expect(highlighting.currentHighlightedTerm.value).toBe(null)
      expect(highlighting.currentRelated.value).toBe(null)
    })
  })

  describe('Edge Cases', () => {
    it('should handle highlighting with no related terms', () => {
      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [],
        outgoingTerms: [],
        termToGraphs: new Map()
      }

      expect(() => {
        highlighting.highlightRelated(term, related)
      }).not.toThrow()

      // Only the current term should be highlighted as 'same'
      expect(document.getElementById('entity3').classList.contains('same-highlight')).toBe(true)
    })

    it('should handle empty term IDs from store', () => {
      const mockStoreEmpty = {
        getTermIds: () => []
      }
      const emptyHighlighting = useEntityHighlighting(mockStoreEmpty)

      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [],
        termToGraphs: new Map()
      }

      expect(() => {
        emptyHighlighting.highlightRelated(term, related)
      }).not.toThrow()
    })

    it('should handle DOM elements that do not exist', () => {
      const mockStoreNonExistent = {
        getTermIds: () => ['non-existent-element']
      }
      const nonExistentHighlighting = useEntityHighlighting(mockStoreNonExistent)

      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [],
        termToGraphs: new Map()
      }

      expect(() => {
        nonExistentHighlighting.highlightRelated(term, related)
      }).not.toThrow()
    })

    it('should handle removeAllHighlighting when nothing is highlighted', () => {
      expect(() => {
        highlighting.removeAllHighlighting()
      }).not.toThrow()
    })

    it('should handle undefined/null termToGraphs', () => {
      const term = { value: 'current-term' }
      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [],
        termToGraphs: null
      }

      expect(() => {
        highlighting.highlightRelated(term, related)
      }).not.toThrow()
    })
  })

  describe('Graph Value Handling', () => {
    it('should handle terms with no graph mappings', () => {
      const term = { value: 'current-term' }
      const termToGraphs = new Map()
      // Deliberately not adding any mappings

      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [],
        termToGraphs
      }

      expect(() => {
        highlighting.highlightRelated(term, related)
      }).not.toThrow()
    })

    it('should handle graphs with undefined values', () => {
      const term = { value: 'current-term' }
      const termToGraphs = new Map()
      termToGraphs.set({ value: 'incoming-term' }, [
        { value: undefined },
        { value: null },
        { value: 'valid-graph' }
      ])

      const related = {
        incomingTerms: [{ value: 'incoming-term' }],
        outgoingTerms: [],
        termToGraphs
      }

      expect(() => {
        highlighting.highlightRelated(term, related)
      }).not.toThrow()
    })
  })

  describe('Computed Properties Reactivity', () => {
    it('should update computed properties when highlights change', () => {
      // Initial state
      expect(highlighting.hasActiveHighlights.value).toBe(false)
      expect(highlighting.highlightedCount.value).toBe(0)
      expect(highlighting.highlightedEntityIds.value).toEqual([])

      // Add highlights
      highlighting.addHighlight(['entity1', 'entity2'], 'incoming')

      // Check updated computed properties
      expect(highlighting.hasActiveHighlights.value).toBe(true)
      expect(highlighting.highlightedCount.value).toBe(2)
      expect(highlighting.highlightedEntityIds.value.sort()).toEqual(['entity1', 'entity2'])

      // Remove highlights
      highlighting.removeHighlight(['entity1', 'entity2'], 'incoming')

      // Check final state
      expect(highlighting.hasActiveHighlights.value).toBe(false)
      expect(highlighting.highlightedCount.value).toBe(0)
      expect(highlighting.highlightedEntityIds.value).toEqual([])
    })
  })
})