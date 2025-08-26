import RdfTreeComponent from './app/App.vue'
import { getEntities } from './traversers/entities.js'

// Export the component and utilities
export const RdfTree = RdfTreeComponent
export { getEntities }

// Export install function for Vue.use()
export function install(app) {
  app.component('RdfTree', RdfTreeComponent)
}

// Export component as default
export default {
  install,
  RdfTree: RdfTreeComponent
}

// Auto-install when used as script tag
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use({ install })
}