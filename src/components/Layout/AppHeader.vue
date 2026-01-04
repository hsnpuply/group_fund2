<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTheme, accentColors } from '../../composables/useTheme'

const emit = defineEmits<{ toggleSidebar: [] }>()

const { preferences, setMode, setAccentColor, isDark } = useTheme()

const searchQuery = ref('')
const currentDate = computed(() => new Intl.DateTimeFormat('fa-IR', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
}).format(new Date()))

const notifications = ref([
  { id: 1, title: 'پرداخت جدید', message: 'مبلغ ۲,۰۰۰,۰۰۰ ریال واریز شد', time: '۵ دقیقه پیش', read: false, category: 'مالی' },
  { id: 2, title: 'عضو جدید', message: 'علی رضایی به سیستم اضافه شد', time: '۱ ساعت پیش', read: false, category: 'اعضا' },
  { id: 3, title: 'قرعه‌کشی موفق', message: 'قرعه‌کشی دور ۱۲ انجام شد', time: 'دیروز', read: true, category: 'سیستم' },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const notificationMenu = ref(false)
const userMenu = ref(false)
const quickActionMenu = ref(false)
const themeMenu = ref(false)

const profile = ref({
  name: 'لیلا حیدری',
  role: 'مدیر ارشد مالی',
  status: 'فعال',
  lastLogin: '۱۴۰۴/۱۰/۱۳ - ۱۰:۲۲',
  avatar: '',
})

const quickActions = [
  { id: 'create-lottery', label: 'ایجاد قرعه‌کشی جدید', icon: 'mdi-trophy' },
  { id: 'add-transaction', label: 'ثبت تراکنش دستی', icon: 'mdi-swap-horizontal' },
  { id: 'payout', label: 'پرداخت جایزه', icon: 'mdi-cash-refund' },
  { id: 'invite', label: 'دعوت عضو جدید', icon: 'mdi-account-plus' },
]

const accentOptions = Object.entries(accentColors).filter(([key]) => key !== 'teal')

const setAccent = (key: keyof typeof accentColors) => setAccentColor(key)
</script>

<template>
  <header class="app-header glass-panel">
    <div class="header-right">
      <button class="menu-toggle" @click="emit('toggleSidebar')">
        <v-icon size="24">mdi-menu</v-icon>
      </button>

      <div class="header-title">
        <div class="title-row">
          <h1>مرکز کنترل مالی</h1>
          <span class="status-chip">
            <v-icon size="16">mdi-shield-check</v-icon>
            محیط امن
          </span>
        </div>
        <div class="header-meta">
          <span class="header-date">{{ currentDate }}</span>
          <span class="divider-dot"></span>
          <span class="header-sub">پشتیبان آخر: ۲۳:۴۵</span>
        </div>
      </div>
    </div>

    <div class="header-left">
      <div class="header-search">
        <v-icon size="20" class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="جستجو در اعضا، تراکنش‌ها، قرعه‌کشی‌ها"
          class="search-input"
        />
      </div>

      <!-- Quick Actions -->
      <v-menu v-model="quickActionMenu" location="bottom end" transition="fade-transition">
        <template #activator="{ props }">
          <button class="header-btn primary" v-bind="props">
            <v-icon size="20">mdi-flash</v-icon>
            <span class="btn-label">اقدام سریع</span>
          </button>
        </template>
        <v-card class="menu-card" width="280">
          <div class="menu-header">
            <div>
              <div class="menu-title">دستورات مدیریتی</div>
              <div class="menu-sub">پوشش عملیات پرتکرار</div>
            </div>
            <v-chip size="small" :style="{ background: 'var(--accent-weak)', color: 'var(--accent-strong)' }">جدید</v-chip>
          </div>
          <v-list density="comfortable">
            <v-list-item
              v-for="item in quickActions"
              :key="item.id"
              :prepend-icon="item.icon"
              :title="item.label"
            />
          </v-list>
        </v-card>
      </v-menu>

      <!-- Theme Switcher -->
      <v-menu v-model="themeMenu" location="bottom end" transition="fade-transition">
        <template #activator="{ props }">
          <button class="header-btn" v-bind="props">
            <v-icon size="22">{{ isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
          </button>
        </template>
        <v-card width="280" class="menu-card">
          <div class="menu-header">
            <div class="menu-title">شخصی‌سازی</div>
            <div class="menu-sub">حالت، رنگ، زبان</div>
          </div>
          <div class="theme-grid">
            <button class="pill" :class="{ active: preferences.mode === 'light' }" @click="setMode('light')">
              <v-icon size="18">mdi-white-balance-sunny</v-icon>
              روشن
            </button>
            <button class="pill" :class="{ active: preferences.mode === 'dark' }" @click="setMode('dark')">
              <v-icon size="18">mdi-weather-night</v-icon>
              تیره
            </button>
            <button class="pill" :class="{ active: preferences.mode === 'system' }" @click="setMode('system')">
              <v-icon size="18">mdi-monitor-shimmer</v-icon>
              سیستم
            </button>
          </div>
          <div class="accent-row">
            <span class="accent-label">رنگ هویت</span>
            <div class="accent-swatches">
              <button
                v-for="[key, val] in accentOptions"
                :key="key"
                class="swatch"
                :style="{ background: val.primary }"
                :class="{ active: preferences.accentColor === key }"
                @click="setAccent(key as any)"
              >
                <v-icon v-if="preferences.accentColor === key" size="16" color="white">mdi-check</v-icon>
              </button>
            </div>
          </div>
        </v-card>
      </v-menu>

      <!-- Notifications -->
      <v-menu v-model="notificationMenu" :close-on-content-click="false" location="bottom end" transition="fade-transition">
        <template #activator="{ props }">
          <button class="header-btn" v-bind="props">
            <v-badge v-if="unreadCount > 0" :content="unreadCount" color="error" offset-x="-2" offset-y="-2">
              <v-icon size="22">mdi-bell-outline</v-icon>
            </v-badge>
            <v-icon v-else size="22">mdi-bell-outline</v-icon>
          </button>
        </template>

        <v-card width="340" class="notification-card menu-card">
          <div class="notification-header">
            <div>
              <span class="notification-title">مرکز اعلان‌ها</span>
              <div class="notification-sub">دسته‌بندی بر اساس سرویس</div>
            </div>
            <button class="mark-all-read">تایید همه</button>
          </div>
          <v-divider />
          <div class="notification-list">
            <div
              v-for="notif in notifications"
              :key="notif.id"
              class="notification-item"
              :class="{ unread: !notif.read }"
            >
              <div class="notif-icon">
                <v-icon size="18" :style="{ color: 'var(--accent)' }">mdi-bell</v-icon>
              </div>
              <div class="notif-content">
                <div class="notif-row">
                  <span class="notif-title">{{ notif.title }}</span>
                  <span class="notif-chip">{{ notif.category }}</span>
                </div>
                <span class="notif-message">{{ notif.message }}</span>
                <span class="notif-time">{{ notif.time }}</span>
              </div>
            </div>
          </div>
          <v-divider />
          <div class="notification-footer">
            <button class="view-all-btn">مشاهده همه اعلان‌ها</button>
          </div>
        </v-card>
      </v-menu>

      <!-- User Menu -->
      <v-menu v-model="userMenu" :close-on-content-click="false" location="bottom end" transition="fade-transition">
        <template #activator="{ props }">
          <button class="user-btn" v-bind="props">
            <v-avatar size="36" :style="{ background: 'var(--accent-weak)' }">
              <v-icon :style="{ color: 'var(--accent-strong)' }">mdi-account</v-icon>
            </v-avatar>
            <div class="user-meta">
              <span class="user-name">{{ profile.name }}</span>
              <span class="user-role">{{ profile.role }}</span>
            </div>
            <v-icon size="18" class="chevron">mdi-chevron-down</v-icon>
          </button>
        </template>

        <v-card width="320" class="user-menu-card menu-card">
          <div class="user-menu-header">
            <div>
              <span class="user-menu-name">{{ profile.name }}</span>
              <span class="user-menu-email">admin@lottery.ir</span>
            </div>
            <v-chip size="small" :style="{ background: 'var(--accent-weak)', color: 'var(--accent-strong)' }">{{ profile.status }}</v-chip>
          </div>
          <div class="user-meta-row">
            <span><v-icon size="16">mdi-lock-check</v-icon> ۲FA فعال</span>
            <span><v-icon size="16">mdi-clock-outline</v-icon> آخرین ورود: {{ profile.lastLogin }}</span>
          </div>
          <v-divider />
          <v-list density="compact">
            <v-list-item prepend-icon="mdi-account-outline" title="پروفایل" />
            <v-list-item prepend-icon="mdi-shield-key" title="امنیت و رمز" />
            <v-list-item prepend-icon="mdi-translate" title="تغییر زبان" />
            <v-divider class="my-1" />
            <v-list-item prepend-icon="mdi-logout" title="خروج" class="logout-item" />
          </v-list>
        </v-card>
      </v-menu>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  height: 76px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 100;
  gap: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.menu-toggle {
  display: none;
  width: 42px;
  height: 42px;
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 12px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.menu-toggle:hover {
  background: var(--accent-weak);
  color: var(--accent-strong);
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-title h1 {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 12px;
  background: var(--accent-weak);
  color: var(--accent-strong);
  font-weight: 700;
  font-size: 0.85rem;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.divider-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  right: 12px;
  color: var(--text-muted);
}

.search-input {
  width: 320px;
  height: 44px;
  padding: 0 14px 0 46px;
  padding-right: 46px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--bg-secondary);
  font-family: inherit;
  font-size: 0.92rem;
  transition: all 0.2s;
  direction: rtl;
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--bg-primary);
  box-shadow: 0 0 0 4px rgba(63, 178, 122, 0.12);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.header-btn {
  height: 44px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-secondary);
  transition: all 0.2s;
  min-width: 44px;
}

.header-btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
}

.header-btn:hover {
  background: var(--accent-weak);
  color: var(--accent-strong);
}

.header-btn.primary:hover {
  background: var(--accent-strong);
  color: #fff;
}

.btn-label {
  font-weight: 700;
  font-size: 0.9rem;
}

.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-btn:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-sm);
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.chevron {
  color: var(--text-muted);
}

.menu-card {
  border-radius: 16px !important;
  box-shadow: var(--shadow-md) !important;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.menu-title {
  font-weight: 800;
  color: var(--text-primary);
}

.menu-sub {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 0 16px 12px;
}

.pill {
  border: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.pill.active {
  border-color: var(--accent);
  background: var(--accent-weak);
  color: var(--accent-strong);
  box-shadow: var(--shadow-sm);
}

.accent-row {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.accent-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.accent-swatches {
  display: flex;
  gap: 8px;
}

.swatch {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  border: 2px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.swatch.active {
  border-color: #fff;
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.notification-title {
  font-weight: 800;
  color: var(--text-primary);
}

.notification-sub {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.notification-list {
  max-height: 320px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  transition: background 0.2s;
  cursor: pointer;
}

.notification-item:hover {
  background: var(--bg-secondary);
}

.notification-item.unread {
  background: var(--accent-weak);
}

.notif-icon {
  width: 40px;
  height: 40px;
  min-width: 40px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.notif-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
}

.notif-title {
  font-weight: 700;
  color: var(--text-primary);
}

.notif-chip {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  padding: 4px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
}

.notif-message {
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.notif-time {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.notification-footer {
  padding: 12px 16px;
  text-align: center;
}

.view-all-btn,
.mark-all-read {
  color: var(--accent-strong);
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 700;
}

.user-menu-card {
  padding: 8px 0;
}

.user-menu-header {
  padding: 0 16px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-menu-name {
  font-weight: 800;
  color: var(--text-primary);
  display: block;
}

.user-menu-email {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.user-meta-row {
  padding: 0 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.logout-item {
  color: #ef5350 !important;
}

@media (max-width: 1200px) {
  .search-input {
    width: 240px;
  }
}

@media (max-width: 1024px) {
  .menu-toggle {
    display: inline-flex;
  }

  .header-search {
    display: none;
  }
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 12px;
    height: auto;
    flex-wrap: wrap;
  }

  .header-left {
    width: 100%;
    justify-content: flex-end;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
