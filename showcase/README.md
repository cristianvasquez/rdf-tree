# RDF-Tree Showcase

This showcase demonstrates the composable RDF visualization component with live sample data.

## Architecture Highlights

### 🧩 Composable Design
- **useEntityNavigation** - Handles scrolling and same-URI cycling
- **useDropdownMenu** - Manages context menus and menu building
- **useEntityHighlighting** - Reactive relationship highlighting
- **useEntityRefs** - Centralized DOM element management

### 🎯 Pointer-Based
The component accepts grapoi pointers `{term, dataset}` for clean separation:
- **Data Loading** - Handled by parent applications (like rdf-display)
- **Visualization** - Pure tree rendering from pointer

### ⚡ Reactive Features
- No direct DOM manipulation
- Vue 3 composition API throughout
- CSS class-based highlighting instead of style injection
- Ref-based element management

## Sample Data

The showcase creates this RDF dataset in memory:

```turtle
@prefix ex: <http://example.org/> .
@prefix foaf: <http://xmlns.com/foaf/0.1/> .

ex:alice a foaf:Person ;
    foaf:name "Alice Smith" ;
    foaf:age 30 ;
    foaf:knows ex:bob, ex:charlie .

ex:bob a foaf:Person ;
    foaf:name "Bob Johnson" ;
    foaf:age 25 ;
    foaf:knows ex:alice .

ex:charlie a foaf:Person ;
    foaf:name "Charlie Brown" ;
    foaf:age 35 ;
    foaf:knows ex:alice .
```

## Interactive Features

- **Click** entities to cycle through same-URI instances
- **Hover** for relationship highlighting and context menus
- **Navigate** through the RDF graph using dropdown menus
- **Smooth scrolling** with visual feedback

## Development

```bash
# Run showcase locally
npm run dev:showcase

# Build for GitHub Pages
npm run build

# Preview built version
npm run preview:showcase
```

The showcase is automatically deployed to GitHub Pages when pushed to main branch.