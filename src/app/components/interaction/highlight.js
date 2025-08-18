import { getBackgroundStyle } from './colors.js'

function highlightRelated (thisTerm, related, getTermIds) {
  const { incomingTerms, outgoingTerms, termToGraphs } = related

  const applyHighlight = (relationClass) => (term) => {
    const graphValues = [...termToGraphs.get(term) ?? []].map(
      x => x.value || 'Default')
    const backgroundStyle = getBackgroundStyle(graphValues, false)
    for (const id of getTermIds(term)) {
      const element = document.getElementById(id)
      if (element) {
        // Add border highlight class
        element.classList.add(`${relationClass}-highlight`)
        // Apply all style properties from backgroundStyle to the element
        Object.assign(element.style, {
          // Store original background to restore later
          '--original-background': element.style.background || 'transparent',
          '--original-backgroundImage': element.style.backgroundImage || 'none',
          // Apply new background
          ...backgroundStyle,
        })
        // Add a data attribute to track which elements have had backgrounds applied
        element.setAttribute('data-highlighted-graphs', 'true')
      }
    }
  }
  incomingTerms?.forEach(applyHighlight('incoming'))
  applyHighlight('same')(thisTerm)
  outgoingTerms?.forEach(applyHighlight('outgoing'))
}

function removeHighlight (thisTerm, related, getTermIds) {
  const { incomingTerms, outgoingTerms } = related

  const removeHighlighting = (relationClass) => (term) => {
    for (const id of getTermIds(term)) {
      const element = document.getElementById(id)
      if (element) {
        // Remove border highlight class
        element.classList.remove(`${relationClass}-highlight`)

        // Restore original background if we applied graph highlighting
        if (element.getAttribute('data-highlighted-graphs') === 'true') {
          // Restore original background
          element.style.background = element.style.getPropertyValue(
            '--original-background') || ''
          element.style.backgroundImage = element.style.getPropertyValue(
            '--original-backgroundImage') || ''

          // Clean up custom properties
          element.style.removeProperty('--original-background')
          element.style.removeProperty('--original-backgroundImage')
          element.style.isolation = ''

          // Remove tracking attribute
          element.removeAttribute('data-highlighted-graphs')
        }
      }
    }
  }

  incomingTerms.forEach(removeHighlighting('incoming'))
  removeHighlighting('same')(thisTerm)
  outgoingTerms.forEach(removeHighlighting('outgoing'))
}

export { highlightRelated, removeHighlight }
