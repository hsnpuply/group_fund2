<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface MenuItem {
  id: string
  title: string
  icon: string
  route?: string
  badge?: number
  dividerAfter?: boolean
}

interface Props {
  collapsed: boolean
  mobileOpen: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: []
  closeMobile: []
}>()

const route = useRoute()
const router = useRouter()

// Main menu items
const mainMenuItems: MenuItem[] = [
  { id: 'dashboard', title: 'داشبورد', icon: 'mdi-view-dashboard-outline', route: '/dashboard' },
  { id: 'lotteries', title: 'قرعه‌کشی‌ها', icon: 'mdi-ticket-outline', route: '/lotteries' },
  { id: 'members', title: 'اعضا', icon: 'mdi-account-group-outline', route: '/members', dividerAfter: true },
  { id: 'transactions', title: 'تراکنش‌ها', icon: 'mdi-swap-horizontal', route: '/transactions' },
  { id: 'reports', title: 'گزارش‌های مالی', icon: 'mdi-chart-box-outline', route: '/reports' },
  { id: 'payouts', title: 'پرداخت جوایز', icon: 'mdi-cash-multiple', route: '/payouts', dividerAfter: true },
  { id: 'notifications', title: 'اعلان‌ها', icon: 'mdi-bell-outline', route: '/notifications', badge: 3 },
  { id: 'settings', title: 'تنظیمات سیستم', icon: 'mdi-cog-outline', route: '/settings' },
]

// Footer menu items
const footerMenuItems: MenuItem[] = [
  { id: 'logs', title: 'گزارش فعالیت‌ها', icon: 'mdi-history', route: '/logs' },
  { id: 'help', title: 'راهنما', icon: 'mdi-help-circle-outline', route: '/help' },
  { id: 'logout', title: 'خروج', icon: 'mdi-logout', route: '/login' },
]

const isActive = (item: MenuItem) => {
  if (!item.route) return false
  return route.path === item.route || route.path.startsWith(item.route + '/')
}

const navigateTo = (item: MenuItem) => {
  if (item.route) {
    if (item.id === 'logout') {
      // Handle logout
      router.push(item.route)
    } else {
      router.push(item.route)
    }
    emit('closeMobile')
  }
}

const sidebarWidth = computed(() => props.collapsed ? '80px' : '260px')
</script>

<template>
  <aside
    class="app-sidebar"
    :class="{
      'collapsed': collapsed,
      'mobile-open': mobileOpen
    }"
    :style="{ width: sidebarWidth }"
  >
    <!-- Logo / Brand -->
    <div class="sidebar-header">
      <div class="brand">
        <div class="brand-icon">
          <v-icon size="28" color="#4caf50">mdi-clover</v-icon>
        </div>
        <transition name="fade">
          <div v-if="!collapsed" class="brand-text">
            <span class="brand-name">صندوق قرعه‌کشی</span>
            <span class="brand-sub">پنل مدیریت</span>
          </div>
        </transition>
      </div>
      
      <!-- Collapse Toggle (Desktop) -->
      <button class="collapse-btn desktop-only" @click="emit('toggle')">
        <v-icon size="20">{{ collapsed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
      </button>
      
      <!-- Close Button (Mobile) -->
      <button class="close-btn mobile-only" @click="emit('closeMobile')">
        <v-icon size="20">mdi-close</v-icon>
      </button>
    </div>

    <!-- Main Navigation -->
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li
          v-for="item in mainMenuItems"
          :key="item.id"
          class="nav-item"
          :class="{ 
            'active': isActive(item),
            'has-divider': item.dividerAfter
          }"
        >
          <button
            class="nav-link"
            @click="navigateTo(item)"
            :title="collapsed ? item.title : ''"
          >
            <span class="nav-icon">
              <v-icon size="22">{{ item.icon }}</v-icon>
            </span>
            <transition name="fade">
              <span v-if="!collapsed" class="nav-text">{{ item.title }}</span>
            </transition>
            <transition name="fade">
              <span v-if="!collapsed && item.badge" class="nav-badge">
                {{ item.badge }}
              </span>
            </transition>
            <span class="active-indicator" />
          </button>
        </li>
      </ul>
    </nav>

    <!-- Footer Navigation -->
    <div class="sidebar-footer">
      <div class="footer-divider" />
      <ul class="nav-list footer-list">
        <li
          v-for="item in footerMenuItems"
          :key="item.id"
          class="nav-item"
          :class="{ 
            'active': isActive(item),
            'logout-item': item.id === 'logout'
          }"
        >
          <button
            class="nav-link"
            @click="navigateTo(item)"
            :title="collapsed ? item.title : ''"
          >
            <span class="nav-icon">
              <v-icon size="22">{{ item.icon }}</v-icon>
            </span>
            <transition name="fade">
              <span v-if="!collapsed" class="nav-text">{{ item.title }}</span>
            </transition>
            <span class="active-indicator" />
          </button>
        </li>
      </ul>
      
      <!-- User Info (when expanded) -->
      <transition name="fade">
        <div v-if="!collapsed" class="user-info">
          <v-avatar size="36" color="#e8f5e9">
            <v-icon color="#4caf50">mdi-account</v-icon>
          </v-avatar>
          <div class="user-details">
            <span class="user-name">مدیر سیستم</span>
            <span class="user-role">مدیر ارشد</span>
          </div>
        </div>
      </transition>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 999;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Header / Brand */
.sidebar-header {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  min-height: 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.brand-icon {
  width: 44px;
  height: 44px;
  min-width: 44px;
  background: linear-gradient(135deg, var(--accent-weak), rgba(0,0,0,0));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-text {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}

.brand-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.brand-sub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.collapse-btn,
.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.collapse-btn:hover,
.close-btn:hover {
  background: var(--accent-weak);
  color: var(--accent-strong);
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 8px;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
  position: relative;
}

.nav-item.has-divider {
  margin-bottom: 12px;
  padding-bottom: 12px;
}

.nav-item.has-divider::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: #f0f0f0;
}

.nav-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
  text-align: right;
}

.nav-link:hover {
  background: var(--bg-secondary);
}

.nav-item.active .nav-link {
  background: linear-gradient(90deg, transparent, var(--accent-weak));
  color: var(--accent-strong);
}

.nav-icon {
  width: 36px;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  transition: all 0.2s;
}

.nav-item.active .nav-icon {
  background: var(--accent);
  color: white;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
}

.nav-text {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.nav-item.active .nav-text {
  color: var(--accent-strong);
  font-weight: 600;
}

.nav-badge {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef5350;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.active-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: var(--accent);
  border-radius: 2px 0 0 2px;
  transition: height 0.2s;
}

.nav-item.active .active-indicator {
  height: 24px;
}

/* Footer */
.sidebar-footer {
  padding: 12px 8px;
  margin-top: auto;
}

.footer-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0 12px 12px;
}

.footer-list {
  margin-bottom: 12px;
}

.logout-item .nav-link:hover {
  background: #ffebee;
}

.logout-item .nav-icon {
  color: #ef5350;
}

.logout-item .nav-text {
  color: #ef5350;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin: 0 4px;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Collapsed State */
.app-sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding: 16px 8px;
}

.app-sidebar.collapsed .brand {
  justify-content: center;
}

.app-sidebar.collapsed .collapse-btn {
  position: absolute;
  left: -16px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
  z-index: 10;
}

.app-sidebar.collapsed .nav-link {
  justify-content: center;
  padding: 12px;
}

.app-sidebar.collapsed .nav-icon {
  margin: 0;
}

.app-sidebar.collapsed .user-info {
  justify-content: center;
  padding: 8px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Tablet and Mobile */
@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(100%);
    width: 280px !important;
    box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
  }
  
  .app-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .desktop-only {
    display: none;
  }
  
  .mobile-only {
    display: flex;
  }
}
</style>
