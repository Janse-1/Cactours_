import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/tokens.css'
import { pointerEffectsDirective } from './directives/pointerEffects'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.directive('pointer-effects', pointerEffectsDirective)

app.mount('#app')
