/**
 * Gist of a PoC to do this with 3d layers instead of colors:
 * https://gist.github.com/cristianvasquez/2b450d60c0d63ff1d1f69240de0abb00
 */

const graphColorCache = new Map()
// Predefined transparent colors
const graphColors = [
  'rgba(190, 190, 190, 0.1)',  // Light Gray
  'rgba(120, 200, 130, 0.1)',  // Soft Green
  'rgba(100, 180, 255, 0.1)',  // Light Blue
  'rgba(255, 180, 70, 0.1)',   // Warm Orange
  'rgba(220, 140, 250, 0.1)',  // Soft Purple
  'rgba(255, 100, 120, 0.1)',  // Bright Red
  'rgba(80, 210, 230, 0.1)',   // Aqua Cyan
  'rgba(255, 240, 80, 0.1)',   // Pastel Yellow

]

// Lazily assign color to a graph
const getGraphColor = (graphValue) => {
  if (!graphValue) return 'transparent'

  if (graphColorCache.has(graphValue)) {
    return graphColorCache.get(graphValue)
  }

  const color = graphColors[graphColorCache.size % graphColors.length]
  graphColorCache.set(graphValue, color)

  return color
}

// Generate background style for graphs
const getBackgroundStyle = (graphValues, ignoreParents = false) => {

  if (!graphValues || graphValues.length === 0) return {}

  // Multiple graphs - create a layered background
  if (graphValues.length > 1) {
    const backgroundLayers = graphValues.map(graph => getGraphColor(graph))
    return {
      backgroundImage: `linear-gradient(45deg, ${backgroundLayers.join(', ')})`,
      isolation: ignoreParents ? 'isolate' : 'auto',
    }
  }

  // Single graph - return its color
  return {
    background: getGraphColor(graphValues[0]),
    isolation: ignoreParents ? 'isolate' : 'auto',
  }
}

export { getBackgroundStyle }
