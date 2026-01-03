import { createRouter, createWebHistory } from 'vue-router'
import register from '../views/auth/register/container.vue';
import login from '../views/auth/login/container.vue';
import OTP from '../views/auth/login/otp/container.vue';
import RegisterOTP from '../views/auth/register/otp/container.vue';
import Dashboard from '../views/dashboard/container.vue';
import Settings from '../views/settings/container.vue';

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
    path: '/otp',
    name: 'otp',
    component: OTP
  },
  {
    path: '/register',
    name: 'Register',
    component: register
  },
  {
    path: '/register/otp',
    name: 'RegisterOTP',
    component: RegisterOTP
  }
  ,
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
