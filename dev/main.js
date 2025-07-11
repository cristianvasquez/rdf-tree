import { createApp } from 'vue'
import { createPinia } from 'pinia'
import DevApp from './DevApp.vue'

const app = createApp(DevApp)
app.use(createPinia())
app.mount('#app')