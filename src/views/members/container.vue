<script setup lang="ts">
import { ref, computed } from 'vue'
import PremiumDataTable from '../../components/DataTable/PremiumDataTable.vue'
import { useMembersData, type Member } from './composables/useMembersData'
import { useTheme } from '../../composables/useTheme'

const { members } = useMembersData()
const { isDark } = useTheme()

// UI State
const viewMode = ref<'table' | 'card'>('table')
const sidebarOpen = ref(true)
const search = ref('')
const itemsPerPage = ref(10)
const selected = ref<Member[]>([])

// Filters
const statusFilter = ref<'all' | 'active' | 'suspended-temp' | 'suspended-permanent'>('all')
const penaltyFilter = ref<'all' | 'none' | 'temporary' | 'permanent'>('all')
const dateFrom = ref<string>('') // Persian date string
const dateTo = ref<string>('')

// Headers for table
const headers = [
  { title: 'تصویر', key: 'avatar', align: 'center' },
  { title: 'نام کامل', key: 'fullName', sortable: true },
  { title: 'وضعیت حساب', key: 'status', align: 'center' },
  { title: 'مدت تعلیق', key: 'suspensionDuration', align: 'center' },
  { title: 'کل قرعه‌کشی‌های شرکت‌کرده', key: 'totalLotteriesJoined', align: 'center', sortable: true },
  { title: 'قرعه‌کشی‌های فعال', key: 'activeLotteriesCount', align: 'center', sortable: true },
  { title: 'کل بلیت‌ها', key: 'totalTicketsOwned', align: 'center', sortable: true },
  { title: 'وضعیت جریمه', key: 'penaltyStatus', align: 'center' },
  { title: 'تاریخ ثبت‌نام', key: 'registrationDate', align: 'center', sortable: true },
  { title: 'عملیات', key: 'actions', align: 'center' }
 ] as const

// Helpers
const normalize = (s: string) => s?.toString().trim().toLowerCase()
const matchesText = (m: Member, q: string) => {
  const n = normalize(q)
  if (!n) return true
  return [m.fullName, m.nationalId, m.phone, m.email].some(v => normalize(v).includes(n))
}

// Simple Persian date compare (string-based fallback)
const inDateRange = (dateStr: string) => {
  // If no bounds provided, accept
  if (!dateFrom.value && !dateTo.value) return true
  const d = dateStr || ''
  const fromOk = !dateFrom.value || d >= dateFrom.value
  const toOk = !dateTo.value || d <= dateTo.value
  return fromOk && toOk
}

const filteredMembers = computed(() => {
  return members.value.filter(m => {
    const statusOk = statusFilter.value === 'all' || m.status === statusFilter.value
    const penaltyOk = penaltyFilter.value === 'all' || m.penaltyStatus === penaltyFilter.value
    const dateOk = inDateRange(m.registrationDate)
    const searchOk = matchesText(m, search.value)
    return statusOk && penaltyOk && dateOk && searchOk
  })
})

// Actions
const detailDialog = ref(false)
const actionDialogOpen = ref(false)
const actionDialogPayload = ref<{ type: 'suspend-temp' | 'suspend-permanent' | 'resume'; items: Member[] } | null>(null)
const activeMember = ref<Member | null>(null)

const openDetails = (m: Member) => {
  activeMember.value = m
  detailDialog.value = true
}

const requestSuspendTemp = (items: Member[]) => {
  actionDialogPayload.value = { type: 'suspend-temp', items }
  actionDialogOpen.value = true
}

const requestSuspendPermanent = (items: Member[]) => {
  actionDialogPayload.value = { type: 'suspend-permanent', items }
  actionDialogOpen.value = true
}

const requestResume = (items: Member[]) => {
  actionDialogPayload.value = { type: 'resume', items }
  actionDialogOpen.value = true
}

const confirmAction = () => {
  if (!actionDialogPayload.value) return
  const { type, items } = actionDialogPayload.value
  items.forEach(m => {
    if (type === 'resume') {
      m.status = 'active'
      m.penaltyStatus = 'none'
      m.suspensionDuration = undefined
    }
    if (type === 'suspend-temp') {
      m.status = 'suspended-temp'
      m.penaltyStatus = 'temporary'
      if (!m.suspensionDuration) m.suspensionDuration = { value: 6, unit: 'months' }
    }
    if (type === 'suspend-permanent') {
      m.status = 'suspended-permanent'
      m.penaltyStatus = 'permanent'
      m.suspensionDuration = undefined
    }
  })
  selected.value = []
  actionDialogPayload.value = null
  actionDialogOpen.value = false
}

const closeAction = () => { actionDialogPayload.value = null; actionDialogOpen.value = false }

// Badges
const statusChipProps = (m: Member) => {
  switch (m.status) {
    case 'active':
      return { color: 'success', text: 'فعال' }
    case 'suspended-temp':
      return { color: 'warning', text: 'تعلیق موقت' }
    case 'suspended-permanent':
      return { color: 'error', text: 'تعلیق دائم' }
  }
}

const penaltyChipProps = (m: Member) => {
  switch (m.penaltyStatus) {
    case 'none':
      return { color: 'success', text: 'بدون جریمه' }
    case 'temporary':
      return { color: 'warning', text: 'موقت' }
    case 'permanent':
      return { color: 'error', text: 'دائم' }
  }
}
</script>

<template>
  <div class="members-page" :class="{ dark: isDark }">
    <!-- Page Header -->
    <div class="page-header">
      <div class="title-area">
        <h1>اعضا</h1>
        <v-chip class="subtitle" color="primary" variant="tonal">مدیریت کاربران مالی</v-chip>
      </div>
      <div class="header-actions">
        <v-btn variant="text" class="me-2" @click="sidebarOpen = !sidebarOpen">
          <v-icon>mdi-filter-variant</v-icon>
          فیلترها
        </v-btn>
        <v-btn-toggle v-model="viewMode" density="comfortable" class="view-toggle">
          <v-btn value="table"><v-icon>mdi-table</v-icon> جدول</v-btn>
          <v-btn value="card"><v-icon>mdi-view-grid</v-icon> کارت‌ها</v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <!-- Right Sidebar Filters -->
    <v-navigation-drawer v-model="sidebarOpen" location="right" width="320" elevation="8" class="filters-drawer" :temporary="$vuetify.display.mobile">
      <div class="filters-content">
        <h3>جستجو و فیلتر</h3>
        <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" hide-details density="compact" variant="outlined" placeholder="نام، کدملی، تلفن یا ایمیل" />
        <v-select v-model="statusFilter" :items="[
            { title: 'همه', value: 'all' },
            { title: 'فعال', value: 'active' },
            { title: 'تعلیق موقت', value: 'suspended-temp' },
            { title: 'تعلیق دائم', value: 'suspended-permanent' }
          ]" label="وضعیت" hide-details density="compact" variant="outlined" />
        <v-select v-model="penaltyFilter" :items="[
            { title: 'همه', value: 'all' },
            { title: 'بدون جریمه', value: 'none' },
            { title: 'موقت', value: 'temporary' },
            { title: 'دائم', value: 'permanent' }
          ]" label="نوع جریمه" hide-details density="compact" variant="outlined" />
        <div class="date-range">
          <v-text-field v-model="dateFrom" label="از تاریخ" placeholder="۱۴۰۳/۰۱/۰۱" hide-details density="compact" variant="outlined" />
          <v-text-field v-model="dateTo" label="تا تاریخ" placeholder="۱۴۰۴/۱۲/۲۹" hide-details density="compact" variant="outlined" />
        </div>
        <v-alert type="info" variant="tonal" class="mt-2">برای دقت بیشتر از تاریخ‌های شمسی استفاده کنید.</v-alert>
      </div>
    </v-navigation-drawer>

    <!-- Content -->
    <div class="content">
      <!-- Table View -->
      <template v-if="viewMode === 'table'">
        <PremiumDataTable
          :headers="headers"
          :items="filteredMembers"
          :search="search"
          :items-per-page="itemsPerPage"
          show-select
          v-model:selected-items="selected"
          title="فهرست اعضا"
          icon="mdi-account-group"
        >
          <template #header-actions>
            <v-btn v-if="selected.length" class="me-2" color="warning" variant="flat" @click="requestSuspendTemp(selected)">
              <v-icon class="me-1">mdi-pause-octagon</v-icon>
              تعلیق موقت ({{ selected.length }})
            </v-btn>
            <v-btn v-if="selected.length" class="me-2" color="error" variant="flat" @click="requestSuspendPermanent(selected)">
              <v-icon class="me-1">mdi-close-octagon</v-icon>
              تعلیق دائم ({{ selected.length }})
            </v-btn>
            <v-btn v-if="selected.length" color="success" variant="flat" @click="requestResume(selected)">
              <v-icon class="me-1">mdi-play-circle</v-icon>
              رفع تعلیق ({{ selected.length }})
            </v-btn>
          </template>

          <template #filters>
            <v-text-field v-model="search" density="compact" placeholder="جستجو..." prepend-inner-icon="mdi-magnify" variant="outlined" hide-details clearable class="search-field" />
            <v-select v-model="itemsPerPage" :items="[5,10,25,50,100]" density="compact" variant="outlined" hide-details class="per-page-select" />
          </template>

          <!-- Avatar -->
          <template #item.avatar="{ item }">
            <v-avatar size="36" class="shadow-sm">
              <img :src="item.avatar" alt="avatar" />
            </v-avatar>
          </template>

          <!-- Status -->
          <template #item.status="{ item }">
            <v-chip :color="statusChipProps(item).color" variant="tonal" size="small" class="status-chip">{{ statusChipProps(item).text }}</v-chip>
          </template>

          <!-- Suspension Duration -->
          <template #item.suspensionDuration="{ item }">
            <span v-if="item.status === 'suspended-temp' && item.suspensionDuration">
              {{ item.suspensionDuration.value }}
              {{ item.suspensionDuration.unit === 'months' ? 'ماه' : 'سال' }}
            </span>
            <span v-else>-</span>
          </template>

          <!-- Penalty -->
          <template #item.penaltyStatus="{ item }">
            <v-chip :color="penaltyChipProps(item).color" variant="tonal" size="small">{{ penaltyChipProps(item).text }}</v-chip>
          </template>

          <!-- Actions -->
          <template #item.actions="{ item }">
            <div class="action-buttons">
              <v-btn icon size="small" variant="text" color="info" @click="openDetails(item)">
                <v-icon size="18">mdi-eye</v-icon>
                <v-tooltip activator="parent" location="top">نمایش جزئیات</v-tooltip>
              </v-btn>
              <v-btn icon size="small" variant="text" color="warning" @click="requestSuspendTemp([item])">
                <v-icon size="18">mdi-pause-octagon</v-icon>
                <v-tooltip activator="parent" location="top">تعلیق موقت</v-tooltip>
              </v-btn>
              <v-btn icon size="small" variant="text" color="error" @click="requestSuspendPermanent([item])">
                <v-icon size="18">mdi-close-octagon</v-icon>
                <v-tooltip activator="parent" location="top">تعلیق دائم</v-tooltip>
              </v-btn>
              <v-btn icon size="small" variant="text" color="success" @click="requestResume([item])">
                <v-icon size="18">mdi-play-circle</v-icon>
                <v-tooltip activator="parent" location="top">رفع تعلیق</v-tooltip>
              </v-btn>
            </div>
          </template>

          <template #footer>
            <div class="table-footer">
              <div class="footer-info">مجموع: {{ filteredMembers.length }} عضو</div>
            </div>
          </template>
        </PremiumDataTable>

        <v-alert v-if="!filteredMembers.length" type="info" variant="tonal" class="mt-4">هیچ عضوی مطابق شرایط یافت نشد. فیلترها را تغییر دهید یا کلیدواژه دیگری جستجو کنید.</v-alert>
      </template>

      <!-- Card View -->
      <template v-else>
        <div class="cards-grid">
          <v-card v-for="m in filteredMembers" :key="m.id" class="member-card" elevation="4">
            <div class="card-header">
              <v-avatar size="48" class="shadow-sm"><img :src="m.avatar" alt="avatar"></v-avatar>
              <div class="card-title">
                <div class="name">{{ m.fullName }}</div>
                <div class="meta">ثبت‌نام: {{ m.registrationDate }}</div>
              </div>
              <v-chip :color="statusChipProps(m).color" variant="tonal" size="small" class="status-chip">{{ statusChipProps(m).text }}</v-chip>
            </div>
            <div class="card-body">
              <div class="stat"><span>قرعه‌کشی‌ها</span><strong>{{ m.totalLotteriesJoined }}</strong></div>
              <div class="stat"><span>فعال</span><strong>{{ m.activeLotteriesCount }}</strong></div>
              <div class="stat"><span>بلیت‌ها</span><strong>{{ m.totalTicketsOwned }}</strong></div>
              <div class="stat"><span>جریمه</span><v-chip :color="penaltyChipProps(m).color" variant="tonal" size="x-small">{{ penaltyChipProps(m).text }}</v-chip></div>
            </div>
            <div class="card-actions">
              <v-btn variant="text" color="info" @click="openDetails(m)"><v-icon class="me-1">mdi-eye</v-icon> جزئیات</v-btn>
              <v-btn variant="text" color="warning" @click="requestSuspendTemp([m])"><v-icon class="me-1">mdi-pause-octagon</v-icon> موقت</v-btn>
              <v-btn variant="text" color="error" @click="requestSuspendPermanent([m])"><v-icon class="me-1">mdi-close-octagon</v-icon> دائم</v-btn>
              <v-btn variant="text" color="success" @click="requestResume([m])"><v-icon class="me-1">mdi-play-circle</v-icon> رفع تعلیق</v-btn>
            </div>
          </v-card>
        </div>
        <v-alert v-if="!filteredMembers.length" type="info" variant="tonal" class="mt-2">نتیجه‌ای مطابق جستجو و فیلترها یافت نشد.</v-alert>
      </template>
    </div>

    <!-- Details Dialog -->
    <v-dialog v-model="detailDialog" max-width="720">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="me-2">mdi-account</v-icon>
          جزئیات عضو
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" @click="detailDialog=false" />
        </v-card-title>
        <v-card-text v-if="activeMember">
          <div class="details-grid">
            <div>
              <strong>نام:</strong> {{ activeMember.fullName }}
            </div>
            <div>
              <strong>کدملی:</strong> {{ activeMember.nationalId }}
            </div>
            <div>
              <strong>تلفن:</strong> {{ activeMember.phone }}
            </div>
            <div>
              <strong>ایمیل:</strong> {{ activeMember.email }}
            </div>
            <div>
              <strong>آدرس:</strong> {{ activeMember.address || '-' }}
            </div>
            <div>
              <strong>ثبت‌نام:</strong> {{ activeMember.registrationDate }}
            </div>
            <div>
              <strong>شرکت در قرعه‌کشی:</strong> {{ activeMember.totalLotteriesJoined }}
            </div>
            <div>
              <strong>فعال:</strong> {{ activeMember.activeLotteriesCount }}
            </div>
            <div>
              <strong>کل بلیت‌ها:</strong> {{ activeMember.totalTicketsOwned }}
            </div>
            <div>
              <strong>آخرین فعالیت:</strong> {{ activeMember.lastActivity }}
            </div>
            <div>
              <strong>مشارکت کل:</strong> {{ new Intl.NumberFormat('fa-IR').format(activeMember.totalContributions) }} ریال
            </div>
            <div>
              <strong>وضعیت:</strong> {{ statusChipProps(activeMember).text }}
            </div>
            <div>
              <strong>جریمه:</strong> {{ penaltyChipProps(activeMember).text }}
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" variant="flat" @click="detailDialog=false">بستن</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Action Confirm Dialog -->
    <v-dialog v-model="actionDialogOpen" max-width="520">
      <v-card>
        <v-card-title>
          <v-icon class="me-2">mdi-shield-alert</v-icon>
          تایید عملیات
        </v-card-title>
        <v-card-text>
          <div v-if="actionDialogPayload">
            <p>
              {{ actionDialogPayload.type === 'resume' ? 'آیا از رفع تعلیق اعضای انتخاب‌شده مطمئن هستید؟' :
                 actionDialogPayload.type === 'suspend-permanent' ? 'آیا از تعلیق دائم اعضای انتخاب‌شده مطمئن هستید؟' :
                 'آیا از تعلیق موقت اعضای انتخاب‌شده مطمئن هستید؟' }}
            </p>
            <v-alert type="warning" variant="tonal" class="mt-2">این عملیات بر {{ actionDialogPayload.items.length }} عضو اعمال می‌شود.</v-alert>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn variant="text" @click="closeAction">انصراف</v-btn>
          <v-spacer />
          <v-btn :color="actionDialogPayload?.type === 'resume' ? 'success' : actionDialogPayload?.type === 'suspend-temp' ? 'warning' : 'error'" variant="flat" @click="confirmAction">تایید</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.members-page { direction: rtl; padding: 12px; }
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.title-area { display: flex; align-items: center; gap: 8px; }
.title-area h1 { font-size: 1.6rem; font-weight: 800; margin: 0; color: var(--text-primary); }
.subtitle { font-weight: 600; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.view-toggle :deep(.v-btn){ border-radius: 12px; }

.filters-drawer { direction: rtl; }
.filters-content { padding: 16px; }
.filters-content h3 { margin-bottom: 8px; }
.date-range { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

.content { margin-top: 8px; }

.status-chip { font-weight: 700; }
.shadow-sm { box-shadow: var(--shadow-sm); }

.cards-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.member-card { border-radius: 16px; overflow: hidden; background: var(--bg-primary); border: 1px solid var(--border-color); transition: transform .18s, box-shadow .18s; }
.member-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
.card-header { display: flex; align-items: center; gap: 12px; padding: 12px; border-bottom: 1px solid var(--border-color); }
.card-title .name { font-weight: 800; color: var(--text-primary); }
.card-title .meta { font-size: .85rem; color: var(--text-secondary); }
.card-body { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 12px; }
.stat { display: flex; align-items: center; justify-content: space-between; background: var(--bg-secondary); padding: 8px; border-radius: 10px; }
.card-actions { display: flex; align-items: center; justify-content: flex-start; gap: 6px; padding: 10px 12px; border-top: 1px solid var(--border-color); }

.table-footer { padding: 12px 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }

@media (max-width: 1280px){ .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px){ .cards-grid { grid-template-columns: 1fr; } .date-range { grid-template-columns: 1fr; } }
</style>
