<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMembersData, type Member } from './composables/useMembersData'
import { useTheme } from '../../composables/useTheme'
import LotteryHistoryTab from '../../components/Members/LotteryHistoryTab.vue'
import TransactionsTab from '../../components/Members/TransactionsTab.vue'
import DocumentsViewer from '../../components/Members/DocumentsViewer.vue'

const { members } = useMembersData()
const { isDark } = useTheme()
const route = useRoute()

const memberId = Number(route.params.id)
const member = computed<Member | undefined>(() => members.value.find(m => m.id === memberId))

// Header quick actions
const confirmDialogOpen = ref(false)
const confirmDialogPayload = ref<{ kind: 'suspend-temp' | 'suspend-permanent' | 'resume' | 'edit-status'; message: string } | null>(null)

const statusChipProps = (m: Member | undefined) => {
  if (!m) return { color: 'info', text: '-' }
  switch (m.status) {
    case 'active': return { color: 'success', text: 'فعال' }
    case 'suspended-temp': return { color: 'warning', text: 'تعلیق موقت' }
    case 'suspended-permanent': return { color: 'error', text: 'تعلیق دائم' }
  }
}

const suspensionSummary = computed(() => {
  const m = member.value
  if (!m || m.status !== 'suspended-temp' || !m.suspensionDuration) return '-'
  const monthsTotal = m.suspensionDuration.unit === 'years' ? (m.suspensionDuration.value * 12) : m.suspensionDuration.value
  const years = Math.floor(monthsTotal / 12)
  const months = monthsTotal % 12
  const yStr = years ? `${years} سال` : ''
  const mStr = months ? `${months} ماه` : ''
  return `${yStr}${yStr && mStr ? ' و ' : ''}${mStr}` || '0 ماه'
})

// Suspension control
const suspendType = ref<'temporary' | 'permanent'>('temporary')
const suspendYears = ref<number>(0)
const suspendMonths = ref<number>(0)
const suspendReason = ref<string>('تاخیر در پرداخت')
const customReason = ref<string>('')

const reasonOptions = [
  'تاخیر در پرداخت',
  'رفتار مشکوک',
  'نقض قوانین',
  'درخواست کاربر',
  'سایر'
]

const monthsItems = Array.from({ length: 13 }, (_, i) => i) // 0..12

const triggerSuspendTemp = () => {
  confirmDialogPayload.value = { kind: 'suspend-temp', message: 'آیا از اعمال تعلیق موقت مطمئن هستید؟' }
  confirmDialogOpen.value = true
}
const triggerSuspendPermanent = () => {
  confirmDialogPayload.value = { kind: 'suspend-permanent', message: 'آیا از اعمال تعلیق دائم مطمئن هستید؟' }
  confirmDialogOpen.value = true
}
const triggerResume = () => {
  confirmDialogPayload.value = { kind: 'resume', message: 'آیا از رفع تعلیق مطمئن هستید؟' }
  confirmDialogOpen.value = true
}


const applyAction = () => {
  if (!member.value || !confirmDialogPayload.value) return
  const m = member.value
  const kind = confirmDialogPayload.value.kind
  if (kind === 'resume') {
    m.status = 'active'
    m.penaltyStatus = 'none'
    m.suspensionDuration = undefined
  }
  if (kind === 'suspend-temp') {
    const totalMonths = Math.max(0, suspendYears.value) * 12 + Math.min(12, Math.max(0, suspendMonths.value))
    const y = Math.floor(totalMonths / 12)
    const mo = totalMonths % 12
    if (y > 0) {
      m.suspensionDuration = { value: y, unit: 'years' }
    } else {
      m.suspensionDuration = { value: mo, unit: 'months' }
    }
    m.status = 'suspended-temp'
    m.penaltyStatus = 'temporary'
  }
  if (kind === 'suspend-permanent') {
    m.status = 'suspended-permanent'
    m.penaltyStatus = 'permanent'
    m.suspensionDuration = undefined
  }
  confirmDialogOpen.value = false
  confirmDialogPayload.value = null
}

// Edit status dialog
const editStatusOpen = ref(false)
const editStatusValue = ref<Member['status']>('active')

const openEditStatus = () => {
  editStatusValue.value = member.value?.status || 'active'
  editStatusOpen.value = true
}
const confirmEditStatus = () => {
  if (!member.value) return
  member.value.status = editStatusValue.value
  if (editStatusValue.value === 'active') {
    member.value.penaltyStatus = 'none'
    member.value.suspensionDuration = undefined
  }
  if (editStatusValue.value === 'suspended-temp' && !member.value.suspensionDuration) {
    member.value.suspensionDuration = { value: 6, unit: 'months' }
    member.value.penaltyStatus = 'temporary'
  }
  if (editStatusValue.value === 'suspended-permanent') {
    member.value.penaltyStatus = 'permanent'
    member.value.suspensionDuration = undefined
  }
  editStatusOpen.value = false
}

// Tabs
const tab = ref<'overview' | 'lotteries' | 'transactions' | 'documents' | 'logs'>('overview')

// Activity logs (sample)
const activityLogs = ref(Array.from({ length: 12 }, (_, i) => ({
  id: 4000 + i,
  date: '۱۴۰۴/۱۰/۱۶',
  actor: i % 4 === 0 ? 'سیستم' : 'ادمین',
  action: i % 2 === 0 ? 'ورود به سیستم' : 'بروزرسانی وضعیت',
  details: 'جزئیات مربوطه'
})))

// Admin notes
const notes = ref<Array<{ id: number; time: string; author: string; text: string }>>([
  { id: 1, time: '۱۴۰۴/۰۹/۲۵', author: 'ادمین ۱', text: 'پیگیری پرداخت معوق در ماه آینده.' },
  { id: 2, time: '۱۴۰۴/۱۰/۱۰', author: 'ادمین ۲', text: 'هشدار رفتاری ثبت شد.' }
])
const noteInput = ref('')
const addNote = () => {
  const text = noteInput.value.trim()
  if (!text) return
  notes.value.unshift({ id: Date.now(), time: 'همین حالا', author: 'ادمین', text })
  noteInput.value = ''
}
</script>

<template>
  <div class="member-detail-page" :class="{ dark: isDark }">
    <v-alert v-if="!member" type="error" class="mb-4" variant="tonal">عضو یافت نشد.</v-alert>
    <template v-else>
      <!-- Header -->
      <v-card class="header-card" elevation="8">
        <div class="header-content">
          <v-avatar size="64" class="shadow-sm"><img :src="member.avatar" alt="avatar"></v-avatar>
          <div class="header-info">
            <div class="name">{{ member.fullName }}</div>
            <div class="meta">شناسه عضو: {{ member.id }}</div>
            <div class="status-row">
              <v-chip :color="statusChipProps(member).color" variant="tonal" class="status-chip">{{ statusChipProps(member).text }}</v-chip>
              <div v-if="member.status === 'suspended-temp'" class="suspension-summary">مدت باقیمانده: {{ suspensionSummary }}</div>
            </div>
          </div>
          <div class="header-actions">
            <v-btn color="warning" variant="flat" class="me-2" @click="triggerSuspendTemp"><v-icon class="me-1">mdi-pause-octagon</v-icon> تعلیق موقت</v-btn>
            <v-btn color="error" variant="flat" class="me-2" @click="triggerSuspendPermanent"><v-icon class="me-1">mdi-close-octagon</v-icon> تعلیق دائم</v-btn>
            <v-btn color="success" variant="flat" class="me-2" @click="triggerResume"><v-icon class="me-1">mdi-play-circle</v-icon> رفع تعلیق</v-btn>
            <v-btn color="primary" variant="tonal" @click="openEditStatus"><v-icon class="me-1">mdi-pencil</v-icon> ویرایش وضعیت</v-btn>
          </div>
        </div>
      </v-card>

      <div class="grid">
        <!-- Suspension Control -->
        <v-card class="suspension-card" elevation="6">
          <div class="card-title">
            <v-icon class="me-2">mdi-shield-alert</v-icon>
            مدیریت تعلیق
          </div>
          <div class="suspension-form">
            <v-radio-group v-model="suspendType" inline hide-details>
              <v-radio label="موقت" value="temporary" />
              <v-radio label="دائم" value="permanent" />
            </v-radio-group>
            <div v-if="suspendType === 'temporary'" class="duration-grid">
              <v-text-field type="number" v-model.number="suspendYears" min="0" label="سال" density="compact" variant="outlined" hide-details />
              <v-select :items="monthsItems" v-model.number="suspendMonths" label="ماه (۰ تا ۱۲)" density="compact" variant="outlined" hide-details />
            </div>
            <v-select :items="reasonOptions" v-model="suspendReason" label="دلیل" density="compact" variant="outlined" hide-details />
            <v-text-field v-if="suspendReason === 'سایر'" v-model="customReason" label="دلیل سفارشی" density="compact" variant="outlined" hide-details />
            <div class="actions">
              <v-btn color="warning" variant="flat" class="me-2" @click="triggerSuspendTemp">اعمال تعلیق موقت</v-btn>
              <v-btn color="error" variant="flat" @click="triggerSuspendPermanent">اعمال تعلیق دائم</v-btn>
            </div>
            <v-alert type="warning" variant="tonal" class="mt-2">لطفاً قبل از اعمال تعلیق، اطلاعات را با دقت بررسی کنید.</v-alert>
          </div>
        </v-card>

        <!-- Profile Information -->
        <v-card class="profile-card" elevation="6">
          <div class="card-title"><v-icon class="me-2">mdi-account</v-icon> اطلاعات پروفایل</div>
          <div class="profile-grid">
            <div><strong>نام:</strong> {{ member.fullName }}</div>
            <div><strong>کدملی:</strong> {{ member.nationalId }}</div>
            <div><strong>ثبت‌نام:</strong> {{ member.registrationDate }}</div>
            <div><strong>آخرین ورود:</strong> {{ member.lastActivity }}</div>
            <div><strong>تلفن:</strong> {{ member.phone }}</div>
            <div><strong>ایمیل:</strong> {{ member.email }}</div>
            <div><strong>آدرس:</strong> {{ member.address || '-' }}</div>
            <div><strong>جریمه فعلی:</strong> {{ member.penaltyStatus === 'none' ? 'بدون جریمه' : member.penaltyStatus === 'temporary' ? 'موقت' : 'دائم' }}</div>
            <div><strong>برنامه بازنشانی جریمه:</strong> ۳ ماه / ۶ ماه / ۱ سال / دائم</div>
          </div>
        </v-card>
      </div>

      <!-- Tabs -->
      <v-card class="tabs-card" elevation="6">
        <v-tabs v-model="tab" align-tabs="end" class="tabs">
          <v-tab value="overview">نمای کلی</v-tab>
          <v-tab value="lotteries">سوابق قرعه‌کشی</v-tab>
          <v-tab value="transactions">تراکنش‌ها</v-tab>
          <v-tab value="documents">مدارک</v-tab>
          <v-tab value="logs">لاگ فعالیت</v-tab>
        </v-tabs>
        <v-divider />
        <div class="tabs-body">
          <!-- Overview -->
          <div v-show="tab === 'overview'" class="overview">
            <div class="metrics">
              <v-card class="metric" elevation="4"><span>قرعه‌کشی‌های شرکت‌کرده</span><strong>{{ member.totalLotteriesJoined }}</strong></v-card>
              <v-card class="metric" elevation="4"><span>قرعه‌کشی‌های فعال</span><strong>{{ member.activeLotteriesCount }}</strong></v-card>
              <v-card class="metric" elevation="4"><span>کل بلیت‌ها</span><strong>{{ member.totalTicketsOwned }}</strong></v-card>
              <v-card class="metric" elevation="4"><span>مشارکت کل</span><strong>{{ new Intl.NumberFormat('fa-IR').format(member.totalContributions) }}</strong></v-card>
            </div>
          </div>

          <!-- Lottery History -->
          <div v-show="tab === 'lotteries'" class="lotteries">
            <LotteryHistoryTab :member-id="memberId" />
          </div>

          <!-- Transactions -->
          <div v-show="tab === 'transactions'" class="transactions">
            <TransactionsTab :member-id="memberId" />
          </div>

          <!-- Documents -->
          <div v-show="tab === 'documents'" class="documents">
            <DocumentsViewer :member-id="memberId" />
          </div>

          <!-- Activity Logs -->
          <div v-show="tab === 'logs'" class="logs">
            <v-table class="elevation-0">
              <thead>
                <tr>
                  <th>زمان</th>
                  <th>عامل</th>
                  <th>اقدام</th>
                  <th>جزئیات</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in activityLogs" :key="l.id">
                  <td>{{ l.date }}</td>
                  <td>{{ l.actor }}</td>
                  <td>{{ l.action }}</td>
                  <td>{{ l.details }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-card>

      <!-- Admin Notes -->
      <v-card class="notes-card" elevation="6">
        <div class="card-title"><v-icon class="me-2">mdi-note-text</v-icon> یادداشت‌های داخلی ادمین</div>
        <div class="notes-input">
          <v-textarea v-model="noteInput" label="یادداشت جدید" auto-grow rows="2" variant="outlined" hide-details />
          <v-btn color="primary" variant="flat" class="mt-2" @click="addNote">افزودن یادداشت</v-btn>
        </div>
        <v-divider class="my-4" />
        <div class="notes-list">
          <v-card v-for="n in notes" :key="n.id" class="note-item" elevation="2">
            <div class="note-header">
              <div class="note-meta">{{ n.time }} • {{ n.author }}</div>
            </div>
            <div class="note-text">{{ n.text }}</div>
          </v-card>
        </div>
      </v-card>

      <!-- Confirm Dialog -->
      <v-dialog v-model="confirmDialogOpen" max-width="520">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-alert</v-icon>
            تایید عملیات
          </v-card-title>
          <v-card-text>
            <div v-if="confirmDialogPayload">
              <p>{{ confirmDialogPayload.message }}</p>
              <v-alert type="warning" variant="tonal" class="mt-2">این عملیات بر وضعیت عضو تاثیر مستقیم دارد.</v-alert>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" @click="confirmDialogOpen=false">انصراف</v-btn>
            <v-spacer />
            <v-btn :color="confirmDialogPayload?.kind === 'resume' ? 'success' : confirmDialogPayload?.kind === 'suspend-temp' ? 'warning' : confirmDialogPayload?.kind === 'suspend-permanent' ? 'error' : 'primary'" variant="flat" @click="applyAction">تایید</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Edit Status Dialog -->
      <v-dialog v-model="editStatusOpen" max-width="480">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-pencil</v-icon>
            ویرایش وضعیت حساب
          </v-card-title>
          <v-card-text>
            <v-select v-model="editStatusValue" :items="[
              { title: 'فعال', value: 'active' },
              { title: 'تعلیق موقت', value: 'suspended-temp' },
              { title: 'تعلیق دائم', value: 'suspended-permanent' }
            ]" label="وضعیت" density="compact" variant="outlined" />
          </v-card-text>
          <v-card-actions>
            <v-btn variant="text" @click="editStatusOpen=false">انصراف</v-btn>
            <v-spacer />
            <v-btn color="primary" variant="flat" @click="confirmEditStatus">ذخیره</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<style scoped>
.member-detail-page { direction: rtl; padding: 16px; }
.header-card { border-radius: 18px; background: var(--bg-primary); border: 1px solid var(--border-color); }
.header-content { display: grid; grid-template-columns: 80px 1fr auto; gap: 16px; align-items: center; padding: 16px; }
.header-info .name { font-weight: 800; font-size: 1.4rem; color: var(--text-primary); }
.header-info .meta { font-size: .9rem; color: var(--text-secondary); }
.status-row { display: flex; align-items: center; gap: 8px; margin-top: 6px; }
.status-chip { font-weight: 700; }
.suspension-summary { font-size: .9rem; color: var(--text-secondary); }
.header-actions { display: flex; align-items: center; gap: 8px; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
.suspension-card, .profile-card { border-radius: 16px; background: var(--bg-primary); border: 1px solid var(--border-color); }
.card-title { font-weight: 800; color: var(--text-primary); display: flex; align-items: center; padding: 12px 16px; border-bottom: 1px solid var(--border-color); }
.suspension-form { padding: 12px 16px; display: grid; gap: 10px; }
.duration-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.actions { display: flex; gap: 8px; }

.tabs-card { border-radius: 16px; background: var(--bg-primary); border: 1px solid var(--border-color); margin-top: 16px; }
.tabs { padding: 8px 12px; }
.tabs-body { padding: 12px 16px; }
.metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.metric { display: flex; align-items: center; justify-content: space-between; padding: 10px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); }

.history-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.history-card { padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); }
.hc-title { font-weight: 700; margin-bottom: 6px; }
.hc-row { display: flex; align-items: center; justify-content: space-between; }

.docs-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.doc-card { padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); display: flex; align-items: center; justify-content: space-between; }
.doc-title { font-weight: 700; }

.logs :deep(table) { width: 100%; }
.logs th, .logs td { padding: 8px; }

.notes-card { border-radius: 16px; background: var(--bg-primary); border: 1px solid var(--border-color); margin-top: 16px; }
.notes-input { padding: 12px 16px; }
.notes-list { display: grid; grid-template-columns: 1fr; gap: 8px; padding: 0 16px 16px; }
.note-item { padding: 10px; border-radius: 12px; }
.note-meta { color: var(--text-secondary); font-size: .85rem; }
.note-text { margin-top: 4px; color: var(--text-primary); }

@media (max-width: 1280px){ .metrics { grid-template-columns: repeat(2, 1fr); } .history-grid { grid-template-columns: repeat(2, 1fr); } .docs-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 768px){ .grid { grid-template-columns: 1fr; } .metrics { grid-template-columns: 1fr; } .history-grid { grid-template-columns: 1fr; } .docs-grid { grid-template-columns: repeat(2, 1fr); } .header-content { grid-template-columns: 64px 1fr; } .header-actions { margin-top: 8px; flex-wrap: wrap; } }
</style>
