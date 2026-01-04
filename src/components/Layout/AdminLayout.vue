<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppBottomNav from './AppBottomNav.vue'

const route = useRoute()

// Sidebar state
const sidebarCollapsed = ref(false)
const sidebarMobileOpen = ref(false)

// Provide sidebar state to children
provide('sidebarCollapsed', sidebarCollapsed)
provide('sidebarMobileOpen', sidebarMobileOpen)

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const toggleMobileSidebar = () => {
  sidebarMobileOpen.value = !sidebarMobileOpen.value
}

const closeMobileSidebar = () => {
  sidebarMobileOpen.value = false
}

// Close mobile sidebar on route change
watch(() => route.path, () => {
  closeMobileSidebar()
})

// Check if current route needs layout (exclude auth pages)
const needsLayout = computed(() => {
  const authRoutes = ['Login', 'Register', 'otp', 'RegisterOTP']
  return !authRoutes.includes(route.name as string)
})

// Content margin based on sidebar state
const contentMargin = computed(() => {
  if (!needsLayout.value) return '0'
  return sidebarCollapsed.value ? '80px' : '260px'
})
</script>

<template>
  <div class="admin-layout" :class="{ 'has-layout': needsLayout }">
    <!-- Sidebar -->
    <AppSidebar
      v-if="needsLayout"
      :collapsed="sidebarCollapsed"
      :mobile-open="sidebarMobileOpen"
      @toggle="toggleSidebar"
      @close-mobile="closeMobileSidebar"
    />

    <!-- Mobile Overlay -->
    <div
      v-if="needsLayout && sidebarMobileOpen"
      class="mobile-overlay"
      @click="closeMobileSidebar"
    />

    <!-- Main Content Area -->
    <div
      class="main-wrapper"
      :style="{ marginRight: needsLayout ? contentMargin : '0' }"
    >
      <!-- Header -->
      <AppHeader
        v-if="needsLayout"
        @toggle-sidebar="toggleMobileSidebar"
      />

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>

    <!-- Bottom Navigation (Mobile) -->
    <AppBottomNav v-if="needsLayout" />
  </div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8faf8 0%, #f0f4f0 100%);
  direction: rtl;
}

.main-wrapper {
  min-height: 100vh;
  transition: margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-content {
  padding: 0;
  min-height: calc(100vh - 64px);
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  backdrop-filter: blur(2px);
}

/* Tablet and below */
@media (max-width: 1024px) {
  .main-wrapper {
    margin-right: 0 !important;
  }
  
  .mobile-overlay {
    display: block;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .page-content {
    padding-bottom: 70px;
  }
}
</style>
