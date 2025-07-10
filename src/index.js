import RdfTreeComponent from './app/App.vue'
import { createPinia } from 'pinia'

// Export the component
export const RdfTree = RdfTreeComponent

// Export install function for Vue.use()
export function install(app) {
  // Install Pinia if not already installed
  if (!app.config.globalProperties.$pinia) {
    app.use(createPinia())
  }
  
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