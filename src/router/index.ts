import { createRouter, createWebHistory } from 'vue-router'
import register from '../views/auth/register/container.vue';
import login from '../views/auth/login/container.vue';
const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/register'
  },
  {
    path: '/login',
    name: 'Login',
    component: login
  },
  {
    path: '/register',
    name: 'Register',
    component: register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
