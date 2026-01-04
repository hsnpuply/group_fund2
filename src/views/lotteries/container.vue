<script setup lang="ts">
import { ref, computed } from 'vue'
import PremiumDataTable from '../../components/DataTable/PremiumDataTable.vue'
import { useTheme } from '../../composables/useTheme'

// Types
interface Lottery {
  id: number
  name: string
  status: 'Draft' | 'Registration' | 'Active' | 'Suspended' | 'Completed'
  type: 'Weekly' | 'Monthly'
  totalTickets: number
  participantCount: number
  nextDrawDate: string
  installmentAmount: number
}

const { isDark } = useTheme()

// Mock Data
const lotteries = ref<Lottery[]>([
  {
    id: 101,
    name: 'قرعه‌کشی بزرگ زمستانه',
    status: 'Active',
    type: 'Monthly',
    totalTickets: 100,
    participantCount: 85,
    nextDrawDate: '۱۴۰۴/۱۱/۰۱',
    installmentAmount: 5000000
  },
  {
    id: 102,
    name: 'صندوق رفاه کارکنان',
    status: 'Registration',
    type: 'Weekly',
    totalTickets: 50,
    participantCount: 12,
    nextDrawDate: '۱۴۰۴/۱۰/۲۰',
    installmentAmount: 2000000
  },
  {
    id: 103,
    name: 'قرعه‌کشی هفتگی امید',
    status: 'Suspended',
    type: 'Weekly',
    totalTickets: 40,
    participantCount: 40,
    nextDrawDate: '-',
    installmentAmount: 1000000
  },
  {
    id: 104,
    name: 'صندوق قرض‌الحسنه خانوادگی',
    status: 'Completed',
    type: 'Monthly',
    totalTickets: 24,
    participantCount: 24,
    nextDrawDate: '-',
    installmentAmount: 10000000
  },
  {
    id: 105,
    name: 'طرح پس‌انداز نوین',
    status: 'Draft',
    type: 'Monthly',
    totalTickets: 200,
    participantCount: 0,
    nextDrawDate: '-',
    installmentAmount: 3000000
  }
])

// Table Headers
const headers = [
  { title: 'شناسه', key: 'id', align: 'start' as const, sortable: true },
  { title: 'نام قرعه‌کشی', key: 'name', align: 'start' as const, sortable: true },
  { title: 'نوع', key: 'type', align: 'center' as const, sortable: true },
  { title: 'تعداد بلیت', key: 'totalTickets', align: 'center' as const, sortable: true },
  { title: 'شرکت‌کنندگان', key: 'participantCount', align: 'center' as const, sortable: true },
  { title: 'تاریخ قرعه‌کشی بعدی', key: 'nextDrawDate', align: 'center' as const, sortable: true },
  { title: 'وضعیت', key: 'status', align: 'center' as const, sortable: true },
  { title: 'عملیات', key: 'actions', align: 'center' as const, sortable: false },
]

// Search and Filters
const search = ref('')
const statusFilter = ref('All')
const typeFilter = ref('All')

const filteredLotteries = computed(() => {
  return lotteries.value.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.value.toLowerCase()) || 
                         item.id.toString().includes(search.value)
    const matchesStatus = statusFilter.value === 'All' || item.status === statusFilter.value
    const matchesType = typeFilter.value === 'All' || item.type === typeFilter.value
    return matchesSearch && matchesStatus && matchesType
  })
})

// Status Helpers
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    Draft: 'پیش‌نویس',
    Registration: 'در حال ثبت‌نام',
    Active: 'فعال',
    Suspended: 'معلق',
    Completed: 'پایان یافته'
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Draft: 'grey',
    Registration: 'info',
    Active: 'success',
    Suspended: 'warning',
    Completed: 'secondary'
  }
  return colors[status] || 'default'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    Draft: 'mdi-file-edit-outline',
    Registration: 'mdi-account-plus-outline',
    Active: 'mdi-check-circle-outline',
    Suspended: 'mdi-pause-circle-outline',
    Completed: 'mdi-flag-checkered'
  }
  return icons[status] || 'mdi-help-circle-outline'
}

// Actions
const showCreateDialog = ref(false)
const currentStep = ref(1)
const totalSteps = 5 // Added Preview step

const newLottery = ref({
  name: '',
  description: '',
  id: 'LOT-' + Math.floor(Math.random() * 10000),
  status: 'Draft',
  totalTickets: 50,
  maxTicketsPerUser: 1,
  installmentAmount: 1000000,
  duration: 12,
  durationUnit: 'month',
  type: 'Monthly',
  drawDay: 1,
  regStartDate: '',
  regEndDate: '',
  timezone: 'Asia/Tehran',
  drawMode: 'Live',
  minParticipants: 10,
  oneWinnerPerRound: true,
  seedBasedDraw: true,
  weightedChanceEnabled: true,
  weightedChanceMultiplier: 2,
  penaltyEnabled: true,
  missedPaymentWarningsAllowed: 2,
  chanceReductionMin: 5,
  chanceReductionMax: 25,
  allowAdminReplacement: true,
  allowSuspension: true,
  preventDeletionAfterStart: true,
  allowRegistrationExtension: true
})

// Form validation state
const formErrors = ref<Record<string, string>>({})
const showConfirmDialog = ref(false)

// Dialog states for actions
const showViewDialog = ref(false)
const showEditDialog = ref(false)
const showHistoryDialog = ref(false)
const showSuspendConfirmDialog = ref(false)

// Selected items
const selectedLotteryForView = ref<Lottery | null>(null)
const selectedLotteryForEdit = ref<Lottery | null>(null)
const selectedLotteryForAction = ref<Lottery | null>(null)

// Edit form state
const editForm = ref({
  name: '',
  description: '',
  maxTicketsPerUser: 1,
  minParticipants: 10,
  weightedChanceEnabled: false,
  penaltyEnabled: false,
  allowSuspension: true
})

// History logs (mock data)
const lotteryHistoryLogs = ref<Array<{
  id: number
  action: string
  actor: string
  timestamp: string
  details: string
}>>([
  { id: 1, action: 'ایجاد قرعه‌کشی', actor: 'علی احمدی', timestamp: '۱۴۰۴/۰۹/۲۰ - ۱۰:۳۰', details: 'قرعه‌کشی جدید ایجاد شد' },
  { id: 2, action: 'تغییر وضعیت', actor: 'سهیلا محمدی', timestamp: '۱۴۰۴/۰۹/۲۱ - ۱۴:۱۵', details: 'وضعیت از پیش‌نویس به در حال ثبت‌نام تغییر کرد' },
  { id: 3, action: 'ویرایش تنظیمات', actor: 'علی احمدی', timestamp: '۱۴۰۴/۰۹/۲۲ - ۰۹:۴۵', details: 'حداقل شرکت‌کنندگان تغییر یافت: ۵ → ۱۰' },
  { id: 4, action: 'شروع ثبت‌نام', actor: 'سیستم', timestamp: '۱۴۰۴/۰۹/۲۳ - ۰۰:۰۰', details: 'دوره ثبت‌نام آغاز شد' },
  { id: 5, action: 'قرعه‌کشی اجرا شد', actor: 'سیستم', timestamp: '۱۴۰۴/۱۰/۰۱ - ۲۰:۰۰', details: 'قرعه‌کشی ماهانه اجرا شد. برنده: رضا صادقی' }
])

// Validation rules
const validateForm = (step: number): boolean => {
  formErrors.value = {}
  
  if (step === 1) {
    if (!newLottery.value.name.trim()) formErrors.value.name = 'نام قرعه‌کشی ضروری است'
    if (!newLottery.value.description.trim()) formErrors.value.description = 'توضیحات ضروری است'
  } else if (step === 2) {
    if (!newLottery.value.totalTickets || newLottery.value.totalTickets < 1) 
      formErrors.value.totalTickets = 'حداقل ۱ بلیت لازم است'
    if (!newLottery.value.maxTicketsPerUser || newLottery.value.maxTicketsPerUser < 1) 
      formErrors.value.maxTicketsPerUser = 'حداقل ۱ بلیت برای هر کاربر لازم است'
    if (newLottery.value.maxTicketsPerUser > newLottery.value.totalTickets) 
      formErrors.value.maxTicketsPerUser = 'نمی‌تواند بیشتر از کل بلیت‌ها باشد'
    if (!newLottery.value.installmentAmount || newLottery.value.installmentAmount < 1000) 
      formErrors.value.installmentAmount = 'مبلغ باید حداقل ۱۰۰۰ ریال باشد'
  } else if (step === 3) {
    if (!newLottery.value.regStartDate) formErrors.value.regStartDate = 'تاریخ شروع ثبت‌نام ضروری است'
    if (!newLottery.value.regEndDate) formErrors.value.regEndDate = 'تاریخ پایان ثبت‌نام ضروری است'
    if (newLottery.value.regStartDate && newLottery.value.regEndDate && 
        newLottery.value.regStartDate >= newLottery.value.regEndDate) {
      formErrors.value.regEndDate = 'تاریخ پایان باید بعد از تاریخ شروع باشد'
    }
  }
  
  return Object.keys(formErrors.value).length === 0
}

const handleCreate = () => {
  showCreateDialog.value = true
  currentStep.value = 1
}

const nextStep = () => {
  if (validateForm(currentStep.value)) {
    if (currentStep.value < totalSteps) currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--
}

const submitLottery = () => {
  console.log('Submitting Lottery:', newLottery.value)
  // Add to list (mock)
  lotteries.value.unshift({
    id: Math.floor(Math.random() * 1000),
    name: newLottery.value.name,
    status: newLottery.value.status as any,
    type: newLottery.value.type as any,
    totalTickets: newLottery.value.totalTickets,
    participantCount: 0,
    nextDrawDate: '-',
    installmentAmount: newLottery.value.installmentAmount
  })
  showCreateDialog.value = false
  showConfirmDialog.value = false
}

const handleView = (item: Lottery) => {
  console.log('View Lottery:', item)
  selectedLotteryForView.value = item
  showViewDialog.value = true
}

const handleEdit = (item: Lottery) => {
  console.log('Edit Lottery:', item)
  selectedLotteryForEdit.value = item
  editForm.value = {
    name: item.name,
    description: '',
    maxTicketsPerUser: 1,
    minParticipants: 10,
    weightedChanceEnabled: false,
    penaltyEnabled: false,
    allowSuspension: true
  }
  showEditDialog.value = true
}

const handleSuspend = (item: Lottery) => {
  console.log('Suspend/Resume Lottery:', item)
  selectedLotteryForAction.value = item
  showSuspendConfirmDialog.value = true
}

const handleHistory = (item: Lottery) => {
  console.log('View History:', item)
  selectedLotteryForAction.value = item
  showHistoryDialog.value = true
}

// Save edit
const saveEdit = () => {
  if (!selectedLotteryForEdit.value) return
  const index = lotteries.value.findIndex(l => l.id === selectedLotteryForEdit.value?.id)
  if (index !== -1) {
    lotteries.value[index].name = editForm.value.name
  }
  showEditDialog.value = false
}

// Confirm suspend/resume
const confirmSuspendToggle = () => {
  if (!selectedLotteryForAction.value) return
  const index = lotteries.value.findIndex(l => l.id === selectedLotteryForAction.value?.id)
  if (index !== -1) {
    lotteries.value[index].status = lotteries.value[index].status === 'Suspended' ? 'Active' : 'Suspended'
  }
  showSuspendConfirmDialog.value = false
}
</script>

<template>
  <div class="lottery-management-page">
    <!-- Page Header -->
    <header class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">مدیریت قرعه‌کشی‌ها</h1>
          <p class="page-subtitle">ایجاد، نظارت و کنترل تمامی صندوق‌های قرعه‌کشی فعال در سیستم</p>
        </div>
        <div class="action-section">
          <v-btn
            color="var(--accent)"
            size="large"
            class="create-btn"
            elevation="2"
            @click="handleCreate"
          >
            <v-icon start>mdi-plus-circle</v-icon>
            ایجاد قرعه‌کشی جدید
          </v-btn>
        </div>
      </div>
    </header>

    <!-- Stats Overview (Optional but adds to enterprise feel) -->
    <div class="stats-row">
      <v-card class="stat-mini-card">
        <div class="stat-icon-box green">
          <v-icon>mdi-ticket-confirmation</v-icon>
        </div>
        <div class="stat-data">
          <span class="stat-label">کل قرعه‌کشی‌ها</span>
          <span class="stat-value">{{ lotteries.length }}</span>
        </div>
      </v-card>
      <v-card class="stat-mini-card">
        <div class="stat-icon-box blue">
          <v-icon>mdi-account-group</v-icon>
        </div>
        <div class="stat-data">
          <span class="stat-label">صندوق‌های فعال</span>
          <span class="stat-value">{{ lotteries.filter(l => l.status === 'Active').length }}</span>
        </div>
      </v-card>
      <v-card class="stat-mini-card">
        <div class="stat-icon-box amber">
          <v-icon>mdi-clock-alert-outline</v-icon>
        </div>
        <div class="stat-data">
          <span class="stat-label">در انتظار ثبت‌نام</span>
          <span class="stat-value">{{ lotteries.filter(l => l.status === 'Registration').length }}</span>
        </div>
      </v-card>
    </div>

    <!-- Main Content: Data Table -->
    <div class="table-container">
      <PremiumDataTable
        title="لیست قرعه‌کشی‌ها"
        icon="mdi-trophy-variant-outline"
        :headers="headers"
        :items="filteredLotteries"
        v-model:search="search"
      >
        <!-- Custom Filters Slot -->
        <template #filters>
          <div class="filters-wrapper">
            <v-text-field
              v-model="search"
              density="compact"
              placeholder="جستجو بر اساس نام یا شناسه..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              clearable
              class="search-input-field"
            />
            
            <v-select
              v-model="statusFilter"
              :items="['All', 'Draft', 'Registration', 'Active', 'Suspended', 'Completed']"
              label="وضعیت"
              density="compact"
              variant="outlined"
              hide-details
              class="filter-select"
            >
              <template #selection="{ item }">
                {{ item.title === 'All' ? 'همه وضعیت‌ها' : getStatusLabel(item.title) }}
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.title === 'All' ? 'همه وضعیت‌ها' : getStatusLabel(item.title)" />
              </template>
            </v-select>

            <v-select
              v-model="typeFilter"
              :items="['All', 'Weekly', 'Monthly']"
              label="نوع"
              density="compact"
              variant="outlined"
              hide-details
              class="filter-select"
            >
              <template #selection="{ item }">
                {{ item.title === 'All' ? 'همه انواع' : (item.title === 'Weekly' ? 'هفتگی' : 'ماهانه') }}
              </template>
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item.title === 'All' ? 'همه انواع' : (item.title === 'Weekly' ? 'هفتگی' : 'ماهانه')" />
              </template>
            </v-select>
          </div>
        </template>

        <!-- Custom Item Slots -->
        <template #item.type="{ item }">
          <v-chip size="small" variant="tonal" :color="item.type === 'Weekly' ? 'blue' : 'purple'">
            {{ item.type === 'Weekly' ? 'هفتگی' : 'ماهانه' }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip
            size="small"
            :color="getStatusColor(item.status)"
            variant="flat"
            class="status-chip"
          >
            <v-icon start size="14">{{ getStatusIcon(item.status) }}</v-icon>
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="action-buttons">
            <v-btn icon size="x-small" variant="text" color="primary" @click="handleView(item)">
              <v-icon>mdi-eye-outline</v-icon>
              <v-tooltip activator="parent" location="top">مشاهده جزئیات</v-tooltip>
            </v-btn>
            
            <v-btn 
              icon 
              size="x-small" 
              variant="text" 
              color="warning" 
              :disabled="item.status !== 'Draft' && item.status !== 'Registration'"
              @click="handleEdit(item)"
            >
              <v-icon>mdi-pencil-outline</v-icon>
              <v-tooltip activator="parent" location="top">ویرایش</v-tooltip>
            </v-btn>

            <v-btn 
              icon 
              size="x-small" 
              variant="text" 
              :color="item.status === 'Suspended' ? 'success' : 'error'"
              @click="handleSuspend(item)"
            >
              <v-icon>{{ item.status === 'Suspended' ? 'mdi-play-circle-outline' : 'mdi-pause-circle-outline' }}</v-icon>
              <v-tooltip activator="parent" location="top">{{ item.status === 'Suspended' ? 'فعال‌سازی مجدد' : 'تعلیق' }}</v-tooltip>
            </v-btn>

            <v-btn icon size="x-small" variant="text" color="info" @click="handleHistory(item)">
              <v-icon>mdi-history</v-icon>
              <v-tooltip activator="parent" location="top">تاریخچه و لاگ‌ها</v-tooltip>
            </v-btn>
          </div>
        </template>
      </PremiumDataTable>
    </div>

    <!-- Create Lottery Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="900px" persistent scrollable>
      <v-card class="create-lottery-card">
        <v-card-title class="dialog-header">
          <div class="header-title-box">
            <v-icon color="var(--accent)" class="me-2">mdi-trophy-plus</v-icon>
            <span>تعریف قرعه‌کشی جدید</span>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="showCreateDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="dialog-body">
          <!-- Stepper Indicator -->
          <div class="stepper-indicator">
            <div 
              v-for="step in totalSteps" 
              :key="step" 
              class="step-item"
              :class="{ 'active': currentStep === step, 'completed': currentStep > step }"
            >
              <div class="step-number">
                <v-icon v-if="currentStep > step" size="16">mdi-check</v-icon>
                <span v-else>{{ step }}</span>
              </div>
              <span class="step-label">
                {{ 
                  step === 1 ? 'اطلاعات پایه' : 
                  step === 2 ? 'تنظیمات بلیت' : 
                  step === 3 ? 'زمان‌بندی' : 
                  step === 4 ? 'تنظیمات پیشرفته' :
                  'بررسی نهایی'
                }}
              </span>
              <div v-if="step < totalSteps" class="step-line"></div>
            </div>
          </div>

          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 1" class="step-content animate-fade-in">
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="newLottery.name"
                  label="نام قرعه‌کشی *"
                  variant="outlined"
                  placeholder="مثلاً: قرعه‌کشی ماهانه رفاه"
                  persistent-placeholder
                  :error="!!formErrors.name"
                  :error-messages="formErrors.name ? [formErrors.name] : []"
                  counter="100"
                  maxlength="100"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="newLottery.id"
                  label="شناسه سیستمی"
                  variant="outlined"
                  readonly
                  bg-color="var(--bg-secondary)"
                  persistent-hint
                  hint="تولید خودکار"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="newLottery.description"
                  label="توضیحات کوتاه *"
                  variant="outlined"
                  rows="3"
                  placeholder="توضیحاتی در مورد اهداف، شرایط، و مزایای این قرعه‌کشی..."
                  persistent-placeholder
                  :error="!!formErrors.description"
                  :error-messages="formErrors.description ? [formErrors.description] : []"
                  counter="500"
                  maxlength="500"
                ></v-textarea>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newLottery.status"
                  :items="[
                    { title: 'پیش‌نویس', value: 'Draft' },
                    { title: 'آماده ثبت‌نام', value: 'Registration' }
                  ]"
                  label="وضعیت اولیه *"
                  variant="outlined"
                  persistent-hint
                  hint="قرعه‌کشی‌های پیش‌نویس قابل ویرایش هستند"
                ></v-select>
              </v-col>
            </v-row>
          </div>

          <!-- Step 2: Ticket & Share Settings -->
          <div v-if="currentStep === 2" class="step-content animate-fade-in">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newLottery.totalTickets"
                  label="تعداد کل بلیت‌ها *"
                  type="number"
                  variant="outlined"
                  suffix="بلیت"
                  min="1"
                  :error="!!formErrors.totalTickets"
                  :error-messages="formErrors.totalTickets ? [formErrors.totalTickets] : []"
                  persistent-hint
                  hint="کل بلیت‌های قابل صدور در این قرعه‌کشی"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newLottery.maxTicketsPerUser"
                  label="حداکثر بلیت برای هر کاربر *"
                  type="number"
                  variant="outlined"
                  suffix="بلیت"
                  min="1"
                  :error="!!formErrors.maxTicketsPerUser"
                  :error-messages="formErrors.maxTicketsPerUser ? [formErrors.maxTicketsPerUser] : []"
                  persistent-hint
                  hint="یک کاربر نمی‌تواند بیشتر از این تعداد خریداری کند"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="newLottery.installmentAmount"
                  label="مبلغ قسط هر بلیت *"
                  type="number"
                  variant="outlined"
                  suffix="ریال"
                  min="1000"
                  :error="!!formErrors.installmentAmount"
                  :error-messages="formErrors.installmentAmount ? [formErrors.installmentAmount] : []"
                  persistent-hint
                  hint="مبلغی که شرکت‌کننده برای هر بلیت باید بپردازد"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <div class="duration-input">
                  <v-text-field
                    v-model.number="newLottery.duration"
                    label="مدت زمان"
                    type="number"
                    variant="outlined"
                    min="1"
                    persistent-hint
                    hint="طول دوره قرعه‌کشی"
                  ></v-text-field>
                  <v-select
                    v-model="newLottery.durationUnit"
                    :items="[
                      { title: 'هفته', value: 'week' },
                      { title: 'ماه', value: 'month' }
                    ]"
                    variant="outlined"
                    hide-details
                  ></v-select>
                </div>
              </v-col>
              <v-col cols="12">
                <v-alert type="info" variant="tonal" icon="mdi-information-outline" class="mt-2">
                  <strong>محاسبه خودکار:</strong> کل سرمایه = {{ new Intl.NumberFormat('fa-IR').format(newLottery.totalTickets * newLottery.installmentAmount) }} ریال
                </v-alert>
              </v-col>
            </v-row>
          </div>

          <!-- Step 3: Schedule & Timing -->
          <div v-if="currentStep === 3" class="step-content animate-fade-in">
            <v-row>
              <v-col cols="12">
                <v-radio-group v-model="newLottery.type" inline label="نوع قرعه‌کشی *">
                  <v-radio label="هفتگی" value="Weekly"></v-radio>
                  <v-radio label="ماهانه" value="Monthly"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-if="newLottery.type === 'Weekly'"
                  v-model="newLottery.drawDay"
                  :items="[
                    { title: 'شنبه', value: 0 },
                    { title: 'یکشنبه', value: 1 },
                    { title: 'دوشنبه', value: 2 },
                    { title: 'سه‌شنبه', value: 3 },
                    { title: 'چهارشنبه', value: 4 },
                    { title: 'پنج‌شنبه', value: 5 },
                    { title: 'جمعه', value: 6 },
                  ]"
                  label="روز قرعه‌کشی در هفته *"
                  variant="outlined"
                  persistent-hint
                  hint="قرعه‌کشی هر هفته در این روز انجام می‌شود"
                ></v-select>
                <v-text-field
                  v-else
                  v-model.number="newLottery.drawDay"
                  label="روز قرعه‌کشی در ماه *"
                  type="number"
                  variant="outlined"
                  min="1"
                  max="31"
                  persistent-hint
                  hint="روزی که قرعه‌کشی ماهانه انجام می‌شود"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="newLottery.timezone"
                  :items="[
                    { title: 'تهران (UTC+3:30)', value: 'Asia/Tehran' },
                    { title: 'مکه (UTC+3:00)', value: 'Asia/Riyadh' },
                    { title: 'استانبول (UTC+3:00)', value: 'Europe/Istanbul' },
                    { title: 'دبی (UTC+4:00)', value: 'Asia/Dubai' },
                  ]"
                  label="منطقه زمانی"
                  variant="outlined"
                  persistent-hint
                  hint="منطقه زمانی برای اجرای قرعه‌کشی"
                ></v-select>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newLottery.regStartDate"
                  label="تاریخ شروع ثبت‌نام *"
                  type="date"
                  variant="outlined"
                  :error="!!formErrors.regStartDate"
                  :error-messages="formErrors.regStartDate ? [formErrors.regStartDate] : []"
                  persistent-hint
                  hint="تاریخی که ثبت‌نام شرکت‌کنندگان آغاز می‌شود"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="newLottery.regEndDate"
                  label="تاریخ پایان ثبت‌نام *"
                  type="date"
                  variant="outlined"
                  :error="!!formErrors.regEndDate"
                  :error-messages="formErrors.regEndDate ? [formErrors.regEndDate] : []"
                  persistent-hint
                  hint="تاریخی که ثبت‌نام بسته می‌شود"
                ></v-text-field>
              </v-col>
            </v-row>
          </div>

          <!-- Step 4: Advanced Settings -->
          <div v-if="currentStep === 4" class="step-content animate-fade-in">
            <v-expansion-panels variant="accordion">
              <!-- Draw Mode & Winner Rules -->
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title class="expansion-title">
                  <v-icon start>mdi-dice-multiple</v-icon>
                  روش قرعه‌کشی و انتخاب برنده
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="newLottery.drawMode"
                        :items="[
                          { title: 'قرعه‌کشی زنده (گردونه شانس)', value: 'Live' },
                          { title: 'ترتیب برنده از پیش تعیین شده', value: 'Predefined' }
                        ]"
                        label="حالت قرعه‌کشی"
                        variant="outlined"
                        persistent-hint
                        hint="روش انتخاب برنده را تعیین کنید"
                      ></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-checkbox
                        v-model="newLottery.oneWinnerPerRound"
                        label="یک برنده در هر دور"
                        color="var(--accent)"
                        persistent-hint
                        hint="یک نفر در هر قرعه‌کشی برنده می‌شود"
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-checkbox
                        v-model="newLottery.seedBasedDraw"
                        label="قرعه‌کشی بر اساس بذر (برای تایید شفافیت)"
                        color="var(--accent)"
                        persistent-hint
                        hint="بذر در سمت سرویس‌دهنده ذخیره می‌شود"
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model.number="newLottery.minParticipants"
                        label="حداقل شرکت‌کنندگان برای شروع"
                        type="number"
                        variant="outlined"
                        min="1"
                        persistent-hint
                        hint="اگر تعداد شرکت‌کنندگان کمتر باشد، قرعه‌کشی تاخیر می‌خورد"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Weighted Chance Rules -->
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title class="expansion-title">
                  <v-icon start>mdi-chart-bell-curve</v-icon>
                  قوانین شانس وزن‌دار
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12">
                      <v-switch
                        v-model="newLottery.weightedChanceEnabled"
                        label="فعال‌سازی شانس مضاعف برای کسانی که برنده نشده‌اند"
                        color="var(--accent)"
                        hide-details
                      ></v-switch>
                    </v-col>
                    <v-col v-if="newLottery.weightedChanceEnabled" cols="12" md="6">
                      <v-text-field
                        v-model.number="newLottery.weightedChanceMultiplier"
                        label="ضریب شانس"
                        type="number"
                        variant="outlined"
                        min="1"
                        max="10"
                        suffix="x"
                        persistent-hint
                        hint="دو نفر آخر که برنده نشده‌اند این ضریب را دریافت می‌کنند"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-alert type="tip" variant="tonal" icon="mdi-lightbulb-outline">
                        <strong>نکته:</strong> اگر ضریب ۲ باشد، شانس دو نفر آخر برنده‌ای دو برابر بقیه است.
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Penalty System -->
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title class="expansion-title">
                  <v-icon start>mdi-alert-circle-outline</v-icon>
                  سیستم جریمه برای عدم پرداخت
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12">
                      <v-switch
                        v-model="newLottery.penaltyEnabled"
                        label="فعال‌سازی سیستم جریمه برای تاخیر در پرداخت"
                        color="var(--accent)"
                        hide-details
                      ></v-switch>
                    </v-col>
                    <v-col v-if="newLottery.penaltyEnabled" cols="12" md="6">
                      <v-text-field
                        v-model.number="newLottery.missedPaymentWarningsAllowed"
                        label="تعداد هشدار‌های مجاز"
                        type="number"
                        variant="outlined"
                        min="0"
                        max="5"
                        suffix="مرتبه"
                        persistent-hint
                        hint="پس از این تعداد، جریمه اعمال می‌شود"
                      ></v-text-field>
                    </v-col>
                    <v-col v-if="newLottery.penaltyEnabled" cols="12" md="6">
                      <div class="chance-reduction-inputs">
                        <v-text-field
                          v-model.number="newLottery.chanceReductionMin"
                          label="کاهش شانس (حداقل)"
                          type="number"
                          variant="outlined"
                          min="0"
                          max="100"
                          suffix="%"
                          hide-details
                        ></v-text-field>
                        <span class="to-text">تا</span>
                        <v-text-field
                          v-model.number="newLottery.chanceReductionMax"
                          label="کاهش شانس (حداکثر)"
                          type="number"
                          variant="outlined"
                          min="0"
                          max="100"
                          suffix="%"
                          hide-details
                        ></v-text-field>
                      </div>
                    </v-col>
                    <v-col cols="12">
                      <v-alert type="warning" variant="tonal" icon="mdi-information-outline">
                        <strong>شفافیت:</strong> پس از {{ newLottery.missedPaymentWarningsAllowed }} هشدار، شانس برنده‌شدن شرکت‌کننده {{ newLottery.chanceReductionMin }}% تا {{ newLottery.chanceReductionMax }}% کاهش می‌یابد.
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Payment Rules -->
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title class="expansion-title">
                  <v-icon start>mdi-credit-card-multiple</v-icon>
                  قوانین پرداخت و مدیریت شرکت‌کننده
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="newLottery.allowAdminReplacement"
                        label="اجازه جایگزینی شرکت‌کننده‌های غیرفعال توسط مدیر"
                        color="var(--accent)"
                        persistent-hint
                        hint="مدیر می‌تواند شرکت‌کننده‌های بدون پرداخت را جایگزین کند"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>

              <!-- Admin Controls -->
              <v-expansion-panel elevation="0">
                <v-expansion-panel-title class="expansion-title">
                  <v-icon start>mdi-shield-admin</v-icon>
                  کنترل‌های مدیریتی
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-checkbox
                        v-model="newLottery.allowSuspension"
                        label="اجازه تعلیق پس از شروع"
                        color="var(--accent)"
                        persistent-hint
                        hint="مدیر می‌تواند قرعه‌کشی را موقتاً تعلیق کند"
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-checkbox
                        v-model="newLottery.preventDeletionAfterStart"
                        label="جلوگیری از حذف پس از شروع"
                        color="var(--accent)"
                        persistent-hint
                        hint="قرعه‌کشی شروع‌شده نمی‌تواند حذف شود"
                      ></v-checkbox>
                    </v-col>
                    <v-col cols="12">
                      <v-checkbox
                        v-model="newLottery.allowRegistrationExtension"
                        label="اجازه تمدید ثبت‌نام اگر حداقل شرکت‌کنندگان نرسیده"
                        color="var(--accent)"
                        persistent-hint
                        hint="اگر تعداد کافی نباشد، مدیر می‌تواند پنجره ثبت‌نام را تمدید کند"
                      ></v-checkbox>
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>

          <!-- Step 5: Preview & Summary -->
          <div v-if="currentStep === 5" class="step-content animate-fade-in">
            <div class="preview-container">
              <!-- Basic Info Summary -->
              <v-card class="preview-card">
                <v-card-title>
                  <v-icon start>mdi-information-outline</v-icon>
                  اطلاعات پایه
                </v-card-title>
                <v-card-text>
                  <div class="preview-row">
                    <span class="label">نام قرعه‌کشی:</span>
                    <span class="value">{{ newLottery.name }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">شناسه:</span>
                    <span class="value">{{ newLottery.id }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">توضیحات:</span>
                    <span class="value">{{ newLottery.description }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">وضعیت اولیه:</span>
                    <v-chip size="small" :color="newLottery.status === 'Draft' ? 'grey' : 'info'" variant="flat">
                      {{ newLottery.status === 'Draft' ? 'پیش‌نویس' : 'آماده ثبت‌نام' }}
                    </v-chip>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Ticket Configuration Summary -->
              <v-card class="preview-card">
                <v-card-title>
                  <v-icon start>mdi-ticket-confirmation</v-icon>
                  تنظیمات بلیت
                </v-card-title>
                <v-card-text>
                  <div class="preview-row">
                    <span class="label">تعداد کل بلیت‌ها:</span>
                    <span class="value">{{ newLottery.totalTickets }} بلیت</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">حداکثر بلیت برای هر کاربر:</span>
                    <span class="value">{{ newLottery.maxTicketsPerUser }} بلیت</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">مبلغ هر بلیت:</span>
                    <span class="value">{{ new Intl.NumberFormat('fa-IR').format(newLottery.installmentAmount) }} ریال</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">مدت زمان:</span>
                    <span class="value">{{ newLottery.duration }} {{ newLottery.durationUnit === 'week' ? 'هفته' : 'ماه' }}</span>
                  </div>
                  <div class="preview-row highlight">
                    <span class="label">کل سرمایه:</span>
                    <span class="value">{{ new Intl.NumberFormat('fa-IR').format(newLottery.totalTickets * newLottery.installmentAmount) }} ریال</span>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Schedule Summary -->
              <v-card class="preview-card">
                <v-card-title>
                  <v-icon start>mdi-calendar-check</v-icon>
                  زمان‌بندی
                </v-card-title>
                <v-card-text>
                  <div class="preview-row">
                    <span class="label">نوع:</span>
                    <v-chip size="small" :color="newLottery.type === 'Weekly' ? 'blue' : 'purple'" variant="flat">
                      {{ newLottery.type === 'Weekly' ? 'هفتگی' : 'ماهانه' }}
                    </v-chip>
                  </div>
                  <div class="preview-row">
                    <span class="label">روز قرعه‌کشی:</span>
                    <span class="value">
                      {{ newLottery.type === 'Weekly' ? 
                        ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'][newLottery.drawDay] :
                        newLottery.drawDay }}
                    </span>
                  </div>
                  <div class="preview-row">
                    <span class="label">منطقه زمانی:</span>
                    <span class="value">{{ newLottery.timezone }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">شروع ثبت‌نام:</span>
                    <span class="value">{{ new Date(newLottery.regStartDate).toLocaleDateString('fa-IR') }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">پایان ثبت‌نام:</span>
                    <span class="value">{{ new Date(newLottery.regEndDate).toLocaleDateString('fa-IR') }}</span>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Advanced Settings Summary -->
              <v-card class="preview-card">
                <v-card-title>
                  <v-icon start>mdi-cog</v-icon>
                  تنظیمات پیشرفته
                </v-card-title>
                <v-card-text>
                  <div class="preview-row">
                    <span class="label">حالت قرعه‌کشی:</span>
                    <span class="value">{{ newLottery.drawMode === 'Live' ? 'قرعه‌کشی زنده' : 'ترتیب از پیش تعیین' }}</span>
                  </div>
                  <div class="preview-row">
                    <span class="label">شانس وزن‌دار:</span>
                    <v-icon v-if="newLottery.weightedChanceEnabled" color="success" size="20">mdi-check</v-icon>
                    <v-icon v-else color="error" size="20">mdi-close</v-icon>
                  </div>
                  <div class="preview-row">
                    <span class="label">سیستم جریمه:</span>
                    <v-icon v-if="newLottery.penaltyEnabled" color="success" size="20">mdi-check</v-icon>
                    <v-icon v-else color="error" size="20">mdi-close</v-icon>
                  </div>
                  <div class="preview-row">
                    <span class="label">حداقل شرکت‌کنندگان:</span>
                    <span class="value">{{ newLottery.minParticipants }} نفر</span>
                  </div>
                </v-card-text>
              </v-card>

              <v-alert type="success" variant="tonal" icon="mdi-check-circle-outline" class="mt-4">
                <strong>آماده‌ای؟</strong> تمام اطلاعات بررسی شد و قرعه‌کشی برای ایجاد آماده است.
              </v-alert>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="dialog-footer">
          <v-spacer></v-spacer>
          <v-btn
            v-if="currentStep > 1"
            variant="text"
            @click="prevStep"
            class="px-6"
          >
            مرحله قبل
          </v-btn>
          
          <v-btn
            v-if="currentStep < totalSteps"
            color="var(--accent)"
            variant="flat"
            @click="nextStep"
            :disabled="Object.keys(formErrors).length > 0"
            class="px-8"
          >
            مرحله بعد
            <v-icon end>mdi-chevron-left</v-icon>
          </v-btn>

          <v-btn
            v-else
            color="var(--accent)"
            variant="flat"
            @click="showConfirmDialog = true"
            class="px-8"
          >
            تایید و ایجاد
            <v-icon end>mdi-check-all</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="500px">
      <v-card class="confirmation-card">
        <v-card-title class="confirmation-header">
          <v-icon color="var(--accent)" size="32" class="me-3">mdi-shield-check</v-icon>
          <div>
            <div>تایید نهایی</div>
            <div class="confirmation-subtitle">آیا مطمئنید؟</div>
          </div>
        </v-card-title>

        <v-card-text class="confirmation-body">
          <div class="confirmation-item">
            <v-icon color="var(--accent-strong)">mdi-clipboard-text</v-icon>
            <div>
              <div class="item-title">نام قرعه‌کشی</div>
              <div class="item-value">{{ newLottery.name }}</div>
            </div>
          </div>

          <div class="confirmation-item">
            <v-icon color="var(--accent-strong)">mdi-ticket-multiple</v-icon>
            <div>
              <div class="item-title">تعداد بلیت‌ها</div>
              <div class="item-value">{{ newLottery.totalTickets }} بلیت</div>
            </div>
          </div>

          <div class="confirmation-item">
            <v-icon color="var(--accent-strong)">mdi-cash-multiple</v-icon>
            <div>
              <div class="item-title">کل سرمایه</div>
              <div class="item-value">{{ new Intl.NumberFormat('fa-IR').format(newLottery.totalTickets * newLottery.installmentAmount) }} ریال</div>
            </div>
          </div>

          <v-alert type="warning" variant="tonal" icon="mdi-alert-outline" class="mt-4">
            این عملیات قابل بازگشت نیست. قرعه‌کشی فوراً در سیستم ایجاد می‌شود.
          </v-alert>
        </v-card-text>

        <v-card-actions class="confirmation-actions">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showConfirmDialog = false" class="px-6">
            انصراف
          </v-btn>
          <v-btn
            color="var(--accent)"
            variant="flat"
            @click="submitLottery"
            class="px-8"
          >
            تایید و ایجاد قرعه‌کشی
            <v-icon end>mdi-check-circle</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Lottery Dialog -->
    <v-dialog v-model="showViewDialog" max-width="700px">
      <v-card class="view-card" v-if="selectedLotteryForView">
        <v-card-title class="view-header">
          <v-icon start color="var(--accent)">mdi-eye-outline</v-icon>
          جزئیات قرعه‌کشی
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showViewDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="view-content">
          <div class="detail-section">
            <h3 class="section-title">اطلاعات پایه</h3>
            <div class="detail-row">
              <span class="detail-label">شناسه:</span>
              <span class="detail-value">{{ selectedLotteryForView.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">نام:</span>
              <span class="detail-value">{{ selectedLotteryForView.name }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">نوع:</span>
              <v-chip size="small" :color="selectedLotteryForView.type === 'Weekly' ? 'blue' : 'purple'" variant="flat">
                {{ selectedLotteryForView.type === 'Weekly' ? 'هفتگی' : 'ماهانه' }}
              </v-chip>
            </div>
            <div class="detail-row">
              <span class="detail-label">وضعیت:</span>
              <v-chip size="small" :color="getStatusColor(selectedLotteryForView.status)" variant="flat">
                {{ getStatusLabel(selectedLotteryForView.status) }}
              </v-chip>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="detail-section">
            <h3 class="section-title">تنظیمات بلیت</h3>
            <div class="detail-row">
              <span class="detail-label">تعداد کل بلیت‌ها:</span>
              <span class="detail-value">{{ selectedLotteryForView.totalTickets }} بلیت</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">مبلغ هر بلیت:</span>
              <span class="detail-value">{{ new Intl.NumberFormat('fa-IR').format(selectedLotteryForView.installmentAmount) }} ریال</span>
            </div>
            <div class="detail-row highlight">
              <span class="detail-label">کل سرمایه:</span>
              <span class="detail-value">{{ new Intl.NumberFormat('fa-IR').format(selectedLotteryForView.totalTickets * selectedLotteryForView.installmentAmount) }} ریال</span>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

          <div class="detail-section">
            <h3 class="section-title">اطلاعات شرکت‌کنندگان</h3>
            <div class="detail-row">
              <span class="detail-label">تعداد شرکت‌کنندگان:</span>
              <span class="detail-value">{{ selectedLotteryForView.participantCount }} نفر</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">قرعه‌کشی بعدی:</span>
              <span class="detail-value">{{ selectedLotteryForView.nextDrawDate }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">درصد پر شدن:</span>
              <v-progress-linear 
                :value="(selectedLotteryForView.participantCount / selectedLotteryForView.totalTickets) * 100"
                color="var(--accent)"
                class="mt-2"
              ></v-progress-linear>
              <span class="detail-value">{{ Math.round((selectedLotteryForView.participantCount / selectedLotteryForView.totalTickets) * 100) }}%</span>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="view-actions">
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="var(--accent)" @click="showViewDialog = false">بستن</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Lottery Dialog -->
    <v-dialog v-model="showEditDialog" max-width="700px">
      <v-card class="edit-card" v-if="selectedLotteryForEdit">
        <v-card-title class="edit-header">
          <v-icon start color="var(--accent)">mdi-pencil-outline</v-icon>
          ویرایش قرعه‌کشی
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showEditDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="edit-content">
          <v-alert type="warning" variant="tonal" icon="mdi-alert-outline" class="mb-4">
            <strong>توجه:</strong> فقط قرعه‌کشی‌های درحالت پیش‌نویس یا ثبت‌نام قابل ویرایش هستند.
          </v-alert>

          <v-form>
            <v-text-field
              v-model="editForm.name"
              label="نام قرعه‌کشی"
              variant="outlined"
              placeholder="نام جدید را وارد کنید"
              persistent-placeholder
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="editForm.description"
              label="توضیحات"
              variant="outlined"
              rows="3"
              placeholder="توضیحات جدید را وارد کنید"
              persistent-placeholder
              class="mb-4"
            ></v-textarea>

            <v-text-field
              v-model.number="editForm.maxTicketsPerUser"
              label="حداکثر بلیت برای هر کاربر"
              type="number"
              variant="outlined"
              min="1"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model.number="editForm.minParticipants"
              label="حداقل شرکت‌کنندگان"
              type="number"
              variant="outlined"
              min="1"
              class="mb-4"
            ></v-text-field>

            <v-checkbox
              v-model="editForm.weightedChanceEnabled"
              label="فعال‌سازی شانس وزن‌دار"
              color="var(--accent)"
              class="mb-4"
            ></v-checkbox>

            <v-checkbox
              v-model="editForm.penaltyEnabled"
              label="فعال‌سازی سیستم جریمه"
              color="var(--accent)"
              class="mb-4"
            ></v-checkbox>

            <v-checkbox
              v-model="editForm.allowSuspension"
              label="اجازه تعلیق پس از شروع"
              color="var(--accent)"
            ></v-checkbox>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="edit-actions">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showEditDialog = false" class="px-6">انصراف</v-btn>
          <v-btn variant="flat" color="var(--accent)" @click="saveEdit" class="px-6">
            <v-icon start>mdi-check</v-icon>
            ذخیره تغییرات
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Suspend/Resume Confirmation Dialog -->
    <v-dialog v-model="showSuspendConfirmDialog" max-width="500px">
      <v-card class="suspend-card" v-if="selectedLotteryForAction">
        <v-card-title class="suspend-header">
          <v-icon start :color="selectedLotteryForAction.status === 'Suspended' ? 'success' : 'warning'">
            {{ selectedLotteryForAction.status === 'Suspended' ? 'mdi-play-circle' : 'mdi-pause-circle' }}
          </v-icon>
          {{ selectedLotteryForAction.status === 'Suspended' ? 'فعال‌سازی مجدد' : 'تعلیق' }}
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="suspend-content">
          <v-alert :type="selectedLotteryForAction.status === 'Suspended' ? 'success' : 'warning'" variant="tonal">
            <strong v-if="selectedLotteryForAction.status === 'Suspended'">
              آیا می‌خواهید قرعه‌کشی {{ selectedLotteryForAction.name }} را فعال‌سازی کنید؟
            </strong>
            <strong v-else>
              آیا می‌خواهید قرعه‌کشی {{ selectedLotteryForAction.name }} را تعلیق کنید؟
            </strong>
          </v-alert>
          
          <p class="mt-4" style="color: var(--text-secondary);">
            <v-icon start size="18">mdi-information-outline</v-icon>
            {{ selectedLotteryForAction.status === 'Suspended' ? 
              'قرعه‌کشی دوباره فعال شده و ثبت‌نام‌ها از سر گرفته خواهند شد.' : 
              'قرعه‌کشی متوقف و همه عملیات مرتبط تعلیق خواهند شد.' }}
          </p>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="suspend-actions">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showSuspendConfirmDialog = false" class="px-6">انصراف</v-btn>
          <v-btn 
            variant="flat" 
            :color="selectedLotteryForAction.status === 'Suspended' ? 'success' : 'warning'" 
            @click="confirmSuspendToggle" 
            class="px-6"
          >
            <v-icon start>{{ selectedLotteryForAction.status === 'Suspended' ? 'mdi-check-circle' : 'mdi-pause-circle' }}</v-icon>
            {{ selectedLotteryForAction.status === 'Suspended' ? 'فعال‌سازی' : 'تعلیق' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- History Dialog -->
    <v-dialog v-model="showHistoryDialog" max-width="700px" scrollable>
      <v-card class="history-card" v-if="selectedLotteryForAction">
        <v-card-title class="history-header">
          <v-icon start color="var(--accent)">mdi-history</v-icon>
          تاریخچه و لاگ‌های فعالیت
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="showHistoryDialog = false"></v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <v-card-text class="history-content">
          <div class="history-item" v-for="log in lotteryHistoryLogs" :key="log.id">
            <div class="history-left">
              <div class="history-timeline-dot"></div>
            </div>
            <div class="history-center">
              <div class="history-action">{{ log.action }}</div>
              <div class="history-details">{{ log.details }}</div>
            </div>
            <div class="history-right">
              <div class="history-actor">{{ log.actor }}</div>
              <div class="history-time">{{ log.timestamp }}</div>
            </div>
          </div>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="history-actions">
          <v-spacer></v-spacer>
          <v-btn variant="flat" color="var(--accent)" @click="showHistoryDialog = false">بستن</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.lottery-management-page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.4s ease-out;
}

.page-header {
  margin-bottom: 8px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 900;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 0.95rem;
}

.create-btn {
  border-radius: 12px !important;
  font-weight: 700 !important;
  letter-spacing: 0 !important;
  text-transform: none !important;
  height: 48px !important;
  padding: 0 24px !important;
  transition: all 0.2s ease;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--accent-rgb), 0.3) !important;
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.stat-mini-card {
  padding: 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  transition: all 0.2s ease;
}

.stat-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-box.green { background: #e8f5e9; color: #2e7d32; }
.stat-icon-box.blue { background: #e3f2fd; color: #1565c0; }
.stat-icon-box.amber { background: #fff8e1; color: #ffa000; }

.stat-data {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

/* Filters */
.filters-wrapper {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input-field {
  min-width: 300px;
}

.filter-select {
  width: 180px;
}

/* Table Customizations */
.status-chip {
  font-weight: 700 !important;
  min-width: 110px;
  justify-content: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 4px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Dialog Styles */
.create-lottery-card {
  border-radius: 20px !important;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px !important;
  background: var(--bg-primary);
}

.header-title-box {
  display: flex;
  align-items: center;
  font-weight: 900;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.dialog-body {
  padding: 24px !important;
  background: var(--bg-primary);
}

.dialog-footer {
  padding: 16px 24px !important;
  background: var(--bg-secondary);
}

/* Stepper Indicator */
.stepper-indicator {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding: 0 20px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex: 1;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.9rem;
  border: 2px solid var(--border-color);
  z-index: 2;
  transition: all 0.3s ease;
}

.step-label {
  margin-top: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.step-line {
  position: absolute;
  top: 18px;
  right: 50%;
  width: 100%;
  height: 2px;
  background: var(--border-color);
  z-index: 1;
}

.step-item.active .step-number {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-weak);
}

.step-item.active .step-label {
  color: var(--accent-strong);
}

.step-item.completed .step-number {
  background: var(--accent-strong);
  color: white;
  border-color: var(--accent-strong);
}

.step-item.completed .step-line {
  background: var(--accent-strong);
}

.step-content {
  min-height: 300px;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 960px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .action-section {
    width: 100%;
  }
  
  .create-btn {
    width: 100%;
  }
  
  .search-input-field, .filter-select {
    width: 100%;
  }

  .duration-input {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 8px;
  }

  .chance-reduction-inputs {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 8px;
    align-items: flex-end;
  }

  .to-text {
    text-align: center;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
}

/* Preview Step Styles */
.preview-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-card {
  border-radius: 14px !important;
  border: 1px solid var(--border-color) !important;
  background: var(--bg-primary) !important;
}

.preview-card :deep(.v-card-title) {
  display: flex;
  align-items: center;
  padding: 16px !important;
  color: var(--text-primary);
  font-weight: 700;
  background: var(--bg-secondary);
}

.preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.preview-row:last-child {
  border-bottom: none;
}

.preview-row.highlight {
  background: var(--accent-weak);
  padding: 12px;
  border-radius: 8px;
  margin-top: 4px;
}

.preview-row .label {
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 180px;
}

.preview-row .value {
  color: var(--text-primary);
  font-weight: 600;
  text-align: left;
}

/* Confirmation Dialog Styles */
.confirmation-card {
  border-radius: 16px !important;
}

.confirmation-header {
  display: flex !important;
  align-items: center;
  padding: 24px !important;
  background: linear-gradient(135deg, var(--accent-weak) 0%, var(--bg-secondary) 100%);
}

.confirmation-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 400;
}

.confirmation-body {
  padding: 24px !important;
}

.confirmation-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-secondary);
  margin-bottom: 12px;
}

.confirmation-item:last-of-type {
  margin-bottom: 0;
}

.item-title {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 600;
}

.item-value {
  font-size: 1rem;
  color: var(--text-primary);
  font-weight: 700;
}

.confirmation-actions {
  padding: 16px 24px !important;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
}

/* Expansion Panel Styles */
.expansion-title {
  font-weight: 700 !important;
  color: var(--text-primary) !important;
}

.duration-input {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 12px;
}

.chance-reduction-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: flex-end;
}

.to-text {
  text-align: center;
  color: var(--text-muted);
  font-weight: 600;
}

/* Animations */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* View Dialog Styles */
.view-card {
  border-radius: 16px !important;
}

.view-header {
  display: flex !important;
  align-items: center;
  padding: 20px !important;
  color: var(--text-primary);
  font-weight: 700;
  background: var(--bg-secondary);
}

.view-content {
  padding: 24px !important;
}

.detail-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.highlight {
  background: var(--accent-weak);
  border-radius: 8px;
  margin-top: 8px;
  padding: 14px;
}

.detail-label {
  font-weight: 700;
  color: var(--text-secondary);
  min-width: 150px;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 600;
  text-align: left;
}

.view-actions {
  padding: 16px 24px !important;
}

/* Edit Dialog Styles */
.edit-card {
  border-radius: 16px !important;
}

.edit-header {
  display: flex !important;
  align-items: center;
  padding: 20px !important;
  color: var(--text-primary);
  font-weight: 700;
  background: var(--bg-secondary);
}

.edit-content {
  padding: 24px !important;
}

.edit-actions {
  padding: 16px 24px !important;
  background: var(--bg-secondary);
}

/* Suspend Dialog Styles */
.suspend-card {
  border-radius: 16px !important;
}

.suspend-header {
  display: flex !important;
  align-items: center;
  padding: 20px !important;
  color: var(--text-primary);
  font-weight: 700;
  background: var(--bg-secondary);
}

.suspend-content {
  padding: 24px !important;
}

.suspend-actions {
  padding: 16px 24px !important;
  background: var(--bg-secondary);
}

/* History Dialog Styles */
.history-card {
  border-radius: 16px !important;
}

.history-header {
  display: flex !important;
  align-items: center;
  padding: 20px !important;
  color: var(--text-primary);
  font-weight: 700;
  background: var(--bg-secondary);
}

.history-content {
  padding: 24px !important;
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: var(--bg-secondary);
  margin-bottom: 12px;
  border-left: 3px solid var(--accent);
}

.history-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 24px;
}

.history-timeline-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--bg-primary);
  margin-top: 2px;
}

.history-center {
  flex: 1;
}

.history-action {
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.history-details {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.history-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 120px;
}

.history-actor {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-secondary);
}

.history-time {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.history-actions {
  padding: 16px 24px !important;
  background: var(--bg-secondary);
}
</style>
