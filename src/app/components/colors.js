import { toRaw } from 'vue'

const graphColorCache = new Map()
// Predefined transparent colors
const graphColors = [
  'rgba(120, 200, 130, 0.3)',  // Soft Green
  'rgba(100, 180, 255, 0.3)',  // Light Blue
  'rgba(255, 180, 70, 0.3)',   // Warm Orange
  'rgba(220, 140, 250, 0.3)',  // Soft Purple
  'rgba(255, 100, 120, 0.3)',  // Bright Red
  'rgba(80, 210, 230, 0.3)',   // Aqua Cyan
  'rgba(255, 240, 80, 0.3)',   // Pastel Yellow
  'rgba(190, 190, 190, 0.3)',  // Light Gray
];


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
const getGraphBackgroundStyle = (graphs, ignoreParents = false) => {
  if (!graphs || graphs.length === 0) return {}

  // Multiple graphs - create layered background
  if (graphs.length > 1) {
    const backgroundLayers = graphs.map(graph => getGraphColor(graph))
    return {
      backgroundImage: `linear-gradient(45deg, ${backgroundLayers.join(', ')})`,
      isolation: ignoreParents ? 'isolate' : 'auto'
    }
  }

  // Single graph - return its color
  return {
    background: getGraphColor(graphs[0]),
    isolation: ignoreParents ? 'isolate' : 'auto'
  }
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
  return termArr.map(x => x.value).filter(value => !parentSet.has(value))
}

export { getGraphBackgroundStyle, getAllTerms, getNewTerms }
