<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface NavItem {
  id: string
  title: string
  icon: string
  activeIcon: string
  route: string
}

const route = useRoute()
const router = useRouter()

const navItems: NavItem[] = [
  { id: 'dashboard', title: 'داشبورد', icon: 'mdi-view-dashboard-outline', activeIcon: 'mdi-view-dashboard', route: '/dashboard' },
  { id: 'lotteries', title: 'قرعه‌کشی', icon: 'mdi-ticket-outline', activeIcon: 'mdi-ticket', route: '/lotteries' },
  { id: 'transactions', title: 'تراکنش', icon: 'mdi-swap-horizontal', activeIcon: 'mdi-swap-horizontal-bold', route: '/transactions' },
  { id: 'members', title: 'اعضا', icon: 'mdi-account-group-outline', activeIcon: 'mdi-account-group', route: '/members' },
  { id: 'more', title: 'بیشتر', icon: 'mdi-dots-horizontal', activeIcon: 'mdi-dots-horizontal', route: '' },
]

const isActive = (item: NavItem) => {
  if (!item.route) return false
  return route.path === item.route || route.path.startsWith(item.route + '/')
}

const navigateTo = (item: NavItem) => {
  if (item.route) {
    router.push(item.route)
  }
}
</script>

<template>
  <nav class="bottom-nav">
    <button
      v-for="item in navItems"
      :key="item.id"
      class="nav-btn"
      :class="{ active: isActive(item) }"
      @click="navigateTo(item)"
    >
      <span class="nav-icon">
        <v-icon size="24">{{ isActive(item) ? item.activeIcon : item.icon }}</v-icon>
      </span>
      <span class="nav-label">{{ item.title }}</span>
    </button>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-top: 1px solid #e8e8e8;
  display: none;
  justify-content: space-around;
  align-items: center;
  padding: 0 8px;
  z-index: 1000;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 12px;
  position: relative;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 3px;
  background: #4caf50;
  border-radius: 0 0 3px 3px;
  transition: width 0.2s;
}

.nav-btn.active::before {
  width: 32px;
}

.nav-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #888;
  transition: all 0.2s;
}

.nav-btn.active .nav-icon {
  color: #4caf50;
  background: #e8f5e9;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #888;
}

.nav-btn.active .nav-label {
  color: #4caf50;
  font-weight: 600;
}

/* Only show on mobile */
@media (max-width: 768px) {
  .bottom-nav {
    display: flex;
  }
}
</style>
