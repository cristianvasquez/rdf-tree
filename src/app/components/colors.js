const graphColorCache = new Map()
// Predefined transparent colors
const graphColors = [
  'rgba(76, 175, 80, 0.2)',    // Green
  'rgba(33, 150, 243, 0.2)',   // Blue
  'rgba(255, 152, 0, 0.2)',    // Orange
  'rgba(156, 39, 176, 0.2)',   // Purple
  'rgba(244, 67, 54, 0.2)',    // Red
  'rgba(0, 188, 212, 0.2)',    // Cyan
  'rgba(255, 235, 59, 0.2)',   // Yellow
  'rgba(158, 158, 158, 0.2)',  // Gray
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
const getGraphBackgroundStyle = (graphs) => {
  if (!graphs || graphs.length === 0) return {}

  // Multiple graphs - create layered background
  if (graphs.length > 1) {
    const backgroundLayers = graphs.map(graph => getGraphColor(graph))
    return {
      backgroundImage: `linear-gradient(45deg, ${backgroundLayers.join(', ')})`,
    }
  }

  // Single graph - return its color
  return { background: getGraphColor(graphs[0]) }
}

function getAllTerms (parentGraphs, termArr) {
  return [
    ...new Set([
      ...parentGraphs, ...termArr.map(x => x.value),
    ])]
}

// Get the graphs that are in childGraphs but not in parentGraphs
function getNewTerms (parentGraphs, termArr) {
  if (!termArr) return []
  const parentSet = new Set(parentGraphs)
  return [...termArr].filter(term => !parentSet.has(term.value))
}

export { getGraphBackgroundStyle, getAllTerms, getNewTerms }
