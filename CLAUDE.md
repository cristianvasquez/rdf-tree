# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RDF Tree is a Vue.js 3 component library for visualizing and exploring RDF datasets in an interactive tree interface. This is a pure component library - the CLI functionality has been moved to the separate `rdf-display` project.

## Development Commands

### Setup & Development
```bash
npm install                # Install dependencies
npm run dev               # Start Vite development server
npm run build             # Build for production
npm run build:lib         # Build as component library
npm run test              # Run mocha tests with snapshots
```

### Using as Library
```bash
npm install rdf-tree
```

```javascript
import { RdfTree } from 'rdf-tree'
// or
import RdfTreePlugin from 'rdf-tree'
app.use(RdfTreePlugin)
```

## Architecture Overview

### Core Stack
- **Framework**: Vue.js 3 with Composition API (JavaScript, not TypeScript)
- **Build**: Vite 6.3.2 with dual mode (dev/lib) and Node.js polyfills for browser RDF libraries
- **State**: Pinia store for reactive dataset management
- **UI**: Naive UI components (peer dependency)
- **RDF**: rdf-ext, @rdfjs/parser-n3, grapoi for graph traversal
- **Distribution**: ES modules + UMD bundle

### Key Directories
- `src/app/` - Vue.js application (main.js, App.vue, state.js, components/)
- `src/io/` - RDF parsing logic (rdf-parser.js)
- `src/traversers/` - Graph traversal algorithms (entities.js, bfsEntity.js)
- `src/namespaces.js` - RDF namespace definitions
- `test/` - Mocha test suite with snapshot testing

### Component Hierarchy
```
App.vue
└── EntityList.vue (displays extracted entities)
    └── Entity.vue (individual entity display)
        └── Term.vue (RDF term rendering)
```

### Data Flow
1. RDF files (Turtle/TriG) parsed via `@rdfjs/parser-n3`
2. Entities extracted using configurable matchers in `entities.js`
3. BFS traversal with depth limits and visited tracking
4. Pinia store manages current dataset, entities, focus state
5. Vue components render interactive tree with focus/facet navigation

## Key Architectural Patterns

### Graph Traversal
- Uses `grapoi` library for RDF graph navigation
- Configurable matcher system in `entities.js` for selective entity extraction
- BFS algorithm with priority-based entity discovery
- Focus-based navigation allows drilling into specific terms

### State Management
- Centralized Pinia store (`src/app/state.js`)
- Reactive dataset updates when files uploaded/changed
- Focus system for exploring related entities
- Loading states and error handling

### Component API
- `RdfTree` component accepts `initialFile` and `showUpload` props
- Self-contained with Pinia store management
- Supports both programmatic usage and plugin installation

## Testing

Uses Mocha with snapshot testing. Test data in `test/support/`. Run `npm run snapshot` to execute tests.

## Special Considerations

- **Browser RDF Libraries**: Vite config includes Node.js polyfills and memfs mocking
- **Multiple File Support**: Can merge multiple RDF files into single dataset
- **Named Graphs**: Files become graph names when processing TriG format
- **Namespace Handling**: Comprehensive namespace definitions including specialized vocabularies (EPO)
- **ES Modules**: Pure ES module implementation throughout codebase