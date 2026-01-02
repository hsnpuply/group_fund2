import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import "vue-toastification/dist/index.css";

// Plugins
import vuetify from './plugins/vuetify'
import router from './router'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import Vue3PersianDatetimePicker from 'vue3-persian-datetime-picker'

const app = createApp(App)

app.use(vuetify)
app.use(router)
app.use(createPinia())
app.use(Toast)
app.component('DatePicker', Vue3PersianDatetimePicker)

app.mount('#app')
