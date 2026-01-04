import { createRouter, createWebHistory } from 'vue-router'
import register from '../views/auth/register/container.vue';
import login from '../views/auth/login/container.vue';
import OTP from '../views/auth/login/otp/container.vue';
import RegisterOTP from '../views/auth/register/otp/container.vue';
import Dashboard from '../views/dashboard/container.vue';
import Lotteries from '../views/lotteries/container.vue';
import Settings from '../views/settings/container.vue';
import Members from '../views/members/container.vue';
import MemberDetail from '../views/members/detail.vue';

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
    path: '/lotteries',
    name: 'Lotteries',
    component: Lotteries
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
  ,
  {
    path: '/members',
    name: 'Members',
    component: Members
  }
  ,
  {
    path: '/members/:id',
    name: 'MemberDetail',
    component: MemberDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
