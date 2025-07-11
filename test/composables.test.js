// Simple test for composables
import { describe, it } from 'mocha'
import { expect } from 'expect'
import { useEntityNavigation, useDropdownMenu, useEntityHighlighting, useEntityRefs } from '../src/app/composables/index.js'

// Mock store for testing
const mockStore = {
  getTermIds: (term) => ['entity1', 'entity2'],
  getRelated: (term) => ({
    incomingTerms: [],
    outgoingTerms: [],
    graphs: []
  }),
  termFacet: () => {}
}

describe('Composables', () => {
  describe('useEntityNavigation', () => {
    it('should provide navigation methods', () => {
      const navigation = useEntityNavigation(mockStore)
      
      expect(navigation.scrollToEntity).toBeDefined()
      expect(navigation.cycleSameEntities).toBeDefined()
      expect(navigation.registerEntity).toBeDefined()
      expect(navigation.isScrollHighlighted).toBeDefined()
    })
  })
  
  describe('useDropdownMenu', () => {
    it('should provide menu methods', () => {
      const menu = useDropdownMenu(mockStore)
      
      expect(menu.updateMenu).toBeDefined()
      expect(menu.clearMenu).toBeDefined()
      expect(menu.parseMenuKey).toBeDefined()
      expect(menu.menuOptions).toBeDefined()
    })
    
    it('should parse menu keys correctly', () => {
      const menu = useDropdownMenu(mockStore)
      
      expect(menu.parseMenuKey('entity-123')).toEqual({
        type: 'entity',
        value: '123'
      })
      
      expect(menu.parseMenuKey('select')).toEqual({
        type: 'select', 
        value: null
      })
    })
  })
  
  describe('useEntityHighlighting', () => {
    it('should provide highlighting methods', () => {
      const highlighting = useEntityHighlighting(mockStore)
      
      expect(highlighting.highlightRelated).toBeDefined()
      expect(highlighting.removeAllHighlighting).toBeDefined()
      expect(highlighting.getHighlightClasses).toBeDefined()
    })
  })
  
  describe('useEntityRefs', () => {
    it('should provide ref management methods', () => {
      const refs = useEntityRefs()
      
      expect(refs.registerEntity).toBeDefined()
      expect(refs.unregisterEntity).toBeDefined()
      expect(refs.getEntity).toBeDefined()
      expect(refs.createRefCallback).toBeDefined()
    })
    
    it('should manage entity registration', () => {
      const refs = useEntityRefs()
      const mockElement = { id: 'test' }
      
      refs.registerEntity('test1', mockElement)
      expect(refs.hasEntity('test1')).toBe(true)
      expect(refs.getEntity('test1')).toStrictEqual(mockElement)
      
      refs.unregisterEntity('test1')
      expect(refs.hasEntity('test1')).toBe(false)
    })
  })
})