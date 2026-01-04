<script setup lang="ts">
import { ref, computed } from 'vue'
import PremiumDataTable from '../../components/DataTable/PremiumDataTable.vue'
import CrudFormDialog from '../../components/DataTable/CrudFormDialog.vue'
import CrudViewDialog from '../../components/DataTable/CrudViewDialog.vue'
import CrudDeleteDialog from '../../components/DataTable/CrudDeleteDialog.vue'
import CrudBulkDeleteDialog from '../../components/DataTable/CrudBulkDeleteDialog.vue'
import { useCrud } from './composables/useCrud'
import { useDataTable } from './composables/useDataTable'

// Fake summary metrics for the lottery group fund
const totalFund = ref(128_500_000) // IRR
const members = ref(24)
const activeTickets = ref(86)
const nextDrawDate = ref(new Date(new Date().getTime() + 7 * 24 * 3600 * 1000))

const formattedFund = computed(() => new Intl.NumberFormat('fa-IR').format(totalFund.value))
const formattedNextDraw = computed(() => new Intl.DateTimeFormat('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(nextDrawDate.value))

// Recent transactions (sample data)
const transactions = ref([
  { id: 1, name: 'مینا صادقی', amount: 2_000_000, type: 'واریز', time: 'لحظاتی پیش' },
  { id: 2, name: 'علیرضا رستمی', amount: 1_500_000, type: 'واریز', time: '۱ ساعت پیش' },
  { id: 3, name: 'پرداخت جایزه دور ۱۲', amount: -15_000_000, type: 'جایزه', time: 'دیروز' },
  { id: 4, name: 'زهرا مرادی', amount: 2_000_000, type: 'واریز', time: 'دیروز' },
])

const totalContributionsToday = computed(() => transactions.value.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0))
const formattedContribToday = computed(() => new Intl.NumberFormat('fa-IR').format(totalContributionsToday.value))

// DataTable & CRUD with Member interface
interface Member {
  id: number
  name: string
  nationalId: string
  phone: string
  totalContributions: number
  tickets: number
  lastPayment: Date
  status: 'فعال' | 'غیرفعال' | 'معلق'
  email: string
}

// Initial members data
const initialMembers: Member[] = [
  {
    id: 1001,
    name: 'علی احمدی',
    nationalId: '0123456789',
    phone: '09121234567',
    totalContributions: 25_000_000,
    tickets: 12,
    lastPayment: new Date('2026-01-02'),
    status: 'فعال',
    email: 'ali@example.com'
  },
  {
    id: 1002,
    name: 'زهرا محمدی',
    nationalId: '9876543210',
    phone: '09129876543',
    totalContributions: 18_500_000,
    tickets: 9,
    lastPayment: new Date('2026-01-01'),
    status: 'فعال',
    email: 'zahra@example.com'
  },
  {
    id: 1003,
    name: 'حسین رضایی',
    nationalId: '1234567890',
    phone: '09131234567',
    totalContributions: 30_000_000,
    tickets: 15,
    lastPayment: new Date('2026-01-03'),
    status: 'فعال',
    email: 'hossein@example.com'
  },
  {
    id: 1004,
    name: 'فاطمه کریمی',
    nationalId: '0987654321',
    phone: '09359876543',
    totalContributions: 12_000_000,
    tickets: 6,
    lastPayment: new Date('2025-12-28'),
    status: 'معلق',
    email: 'fatemeh@example.com'
  },
  {
    id: 1005,
    name: 'محمد نوری',
    nationalId: '5555555555',
    phone: '09121112222',
    totalContributions: 40_000_000,
    tickets: 20,
    lastPayment: new Date('2026-01-03'),
    status: 'فعال',
    email: 'mohammad@example.com'
  },
  {
    id: 1006,
    name: 'سارا اکبری',
    nationalId: '6666666666',
    phone: '09133334444',
    totalContributions: 8_500_000,
    tickets: 4,
    lastPayment: new Date('2025-12-20'),
    status: 'غیرفعال',
    email: 'sara@example.com'
  },
  {
    id: 1007,
    name: 'رضا مرادی',
    nationalId: '7777777777',
    phone: '09357778888',
    totalContributions: 22_000_000,
    tickets: 11,
    lastPayment: new Date('2026-01-02'),
    status: 'فعال',
    email: 'reza@example.com'
  },
  {
    id: 1008,
    name: 'مریم حسینی',
    nationalId: '8888888888',
    phone: '09129990000',
    totalContributions: 15_500_000,
    tickets: 8,
    lastPayment: new Date('2025-12-30'),
    status: 'فعال',
    email: 'maryam@example.com'
  },
  {
    id: 1009,
    name: 'امیر تقوی',
    nationalId: '9999999999',
    phone: '09131112233',
    totalContributions: 35_000_000,
    tickets: 18,
    lastPayment: new Date('2026-01-03'),
    status: 'فعال',
    email: 'amir@example.com'
  },
  {
    id: 1010,
    name: 'نرگس فراهانی',
    nationalId: '1111111111',
    phone: '09354445566',
    totalContributions: 20_000_000,
    tickets: 10,
    lastPayment: new Date('2026-01-01'),
    status: 'فعال',
    email: 'narges@example.com'
  },
  {
    id: 1011,
    name: 'پویا مهدوی',
    nationalId: '2222222222',
    phone: '09126667788',
    totalContributions: 5_000_000,
    tickets: 2,
    lastPayment: new Date('2025-12-15'),
    status: 'معلق',
    email: 'pouya@example.com'
  },
  {
    id: 1012,
    name: 'الهام صفری',
    nationalId: '3333333333',
    phone: '09138889900',
    totalContributions: 28_000_000,
    tickets: 14,
    lastPayment: new Date('2026-01-02'),
    status: 'فعال',
    email: 'elham@example.com'
  },
]

// Use CRUD composable
const crud = useCrud<Member>({ initialData: initialMembers })

// Use DataTable composable
const dataTable = useDataTable(crud.items, {
  initialItemsPerPage: 10,
  formatters: {
    totalContributions: (value: number) => formatCurrency(value),
    lastPayment: (value: Date) => formatDate(value),
  },
  filterFn: (item: Member, filters: Record<string, any>) => {
    if (filters.status && item.status !== filters.status) {
      return false
    }
    return true
  }
})

// Table headers
const headers = [
  { title: 'شناسه', key: 'id', align: 'start' as const, sortable: true },
  { title: 'نام و نام خانوادگی', key: 'name', align: 'start' as const, sortable: true },
  { title: 'کد ملی', key: 'nationalId', align: 'start' as const, sortable: true },
  { title: 'شماره تماس', key: 'phone', align: 'start' as const, sortable: true },
  { title: 'مجموع واریزی‌ها', key: 'totalContributions', align: 'start' as const, sortable: true },
  { title: 'تعداد بلیت', key: 'tickets', align: 'center' as const, sortable: true },
  { title: 'آخرین پرداخت', key: 'lastPayment', align: 'start' as const, sortable: true },
  { title: 'وضعیت', key: 'status', align: 'center' as const, sortable: true },
  { title: 'عملیات', key: 'actions', align: 'center' as const, sortable: false },
]

// Form validation
const formLastPaymentStr = ref<string>('')
const required = (v: any) => (!!v || v === 0) || 'ضروری'
const numeric = (v: any) => (v === '' || v === null || !isNaN(Number(v))) || 'عدد وارد کنید'

// Format helpers
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fa-IR').format(value) + ' ﷼'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'فعال': return 'success'
    case 'غیرفعال': return 'error'
    case 'معلق': return 'warning'
    default: return 'default'
  }
}

// CRUD Handlers
const handleCreate = () => {
  crud.openCreate({
    name: '',
    nationalId: '',
    phone: '',
    email: '',
    totalContributions: 0,
    tickets: 0,
    status: 'فعال',
  })
  formLastPaymentStr.value = new Date().toISOString().split('T')[0] ?? ''
}

const handleEdit = (item: Member) => {
  crud.openEdit(item)
  formLastPaymentStr.value = new Date(item.lastPayment).toISOString().split('T')[0] ?? ''
}

const handleSave = async () => {
  const lastPaymentDate = formLastPaymentStr.value ? new Date(formLastPaymentStr.value) : new Date()
  crud.formItem.value.lastPayment = lastPaymentDate
  await crud.saveItem()
}

const handleExport = () => {
  dataTable.exportToCSV(
    [
      { key: 'id', title: 'شناسه' },
      { key: 'name', title: 'نام' },
      { key: 'nationalId', title: 'کد ملی' },
      { key: 'phone', title: 'تلفن' },
      { key: 'totalContributions', title: 'مجموع واریزی' },
      { key: 'tickets', title: 'بلیت' },
      { key: 'lastPayment', title: 'آخرین پرداخت' },
      { key: 'status', title: 'وضعیت' },
      { key: 'email', title: 'ایمیل' }
    ],
    `members_${new Date().getTime()}.csv`
  )
}
</script>

<template>
  <div class="dashboard-page">
    <!-- Background decoration -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Cards Row -->
      <div class="stats-grid">
        <div class="stat-card gradient-green">
          <div class="stat-icon">
            <v-icon size="28">mdi-safe</v-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">موجودی صندوق</span>
            <span class="stat-value" dir="ltr">﷼ {{ formattedFund }}</span>
          </div>
          <div class="stat-trend up">
            <v-icon size="16">mdi-trending-up</v-icon>
            <span>+۱۲٪</span>
          </div>
        </div>

        <div class="stat-card gradient-blue">
          <div class="stat-icon">
            <v-icon size="28">mdi-account-group</v-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">تعداد اعضا</span>
            <span class="stat-value">{{ members }} نفر</span>
          </div>
          <div class="stat-trend up">
            <v-icon size="16">mdi-trending-up</v-icon>
            <span>+۳</span>
          </div>
        </div>

        <div class="stat-card gradient-purple">
          <div class="stat-icon">
            <v-icon size="28">mdi-ticket-confirmation</v-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">بلیت‌های فعال</span>
            <span class="stat-value">{{ activeTickets }}</span>
          </div>
          <div class="stat-trend up">
            <v-icon size="16">mdi-trending-up</v-icon>
            <span>+۸</span>
          </div>
        </div>

        <div class="stat-card gradient-amber">
          <div class="stat-icon">
            <v-icon size="28">mdi-calendar-clock</v-icon>
          </div>
          <div class="stat-info">
            <span class="stat-label">قرعه‌کشی بعدی</span>
            <span class="stat-value-sm">{{ formattedNextDraw }}</span>
          </div>
          <div class="stat-badge">
            <span>۷ روز</span>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Transactions Panel -->
        <div class="panel-card transactions-panel">
          <div class="panel-header">
            <div class="panel-title">
              <div class="title-icon">
                <v-icon size="20">mdi-swap-horizontal</v-icon>
              </div>
              <span>آخرین تراکنش‌ها</span>
            </div>
            <div class="panel-stat" dir="ltr">
              <span class="stat-prefix">امروز:</span>
              ﷼ {{ formattedContribToday }}
            </div>
          </div>

          <div class="transactions-list">
            <div v-for="t in transactions" :key="t.id" class="tx-item">
              <div class="tx-avatar" :class="{ expense: t.amount < 0 }">
                <v-icon size="18">{{ t.amount < 0 ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon>
              </div>
              <div class="tx-info">
                <span class="tx-name">{{ t.name }}</span>
                <span class="tx-time">{{ t.time }}</span>
              </div>
              <div class="tx-amount" :class="{ expense: t.amount < 0 }">
                <span dir="ltr">{{ t.amount < 0 ? '-' : '+' }}﷼ {{ new Intl.NumberFormat('fa-IR').format(Math.abs(t.amount)) }}</span>
              </div>
            </div>
          </div>

          <button class="view-all-btn">
            <span>مشاهده همه تراکنش‌ها</span>
            <v-icon size="18">mdi-chevron-left</v-icon>
          </button>
        </div>

        <!-- Schedule Panel -->
        <div class="panel-card schedule-panel">
          <div class="panel-header">
            <div class="panel-title">
              <div class="title-icon gold">
                <v-icon size="20">mdi-trophy</v-icon>
              </div>
              <span>برنامه قرعه‌کشی</span>
            </div>
          </div>

          <div class="schedule-list">
            <div class="schedule-item highlight">
              <div class="schedule-icon">
                <v-icon size="20" color="#4caf50">mdi-calendar-check</v-icon>
              </div>
              <div class="schedule-info">
                <span class="schedule-title">قرعه‌کشی بعدی</span>
                <span class="schedule-date">{{ formattedNextDraw }}</span>
              </div>
              <v-chip size="small" color="success" variant="tonal">فعال</v-chip>
            </div>

            <div class="schedule-item">
              <div class="schedule-icon">
                <v-icon size="20" color="#888">mdi-clock-outline</v-icon>
              </div>
              <div class="schedule-info">
                <span class="schedule-title">زمان قرعه‌کشی</span>
                <span class="schedule-date">هر جمعه ساعت ۲۰:۰۰</span>
              </div>
            </div>

            <div class="schedule-item">
              <div class="schedule-icon">
                <v-icon size="20" color="#ff9800">mdi-cash</v-icon>
              </div>
              <div class="schedule-info">
                <span class="schedule-title">سقف جایزه</span>
                <span class="schedule-date">۲۰,۰۰۰,۰۰۰ ﷼</span>
              </div>
            </div>
          </div>

          <div class="panel-actions">
            <v-btn color="#4caf50" variant="flat" class="action-btn">
              <v-icon class="me-2" size="18">mdi-plus</v-icon>
              ثبت واریز جدید
            </v-btn>
            <v-btn variant="outlined" color="#4caf50" class="action-btn">
              <v-icon class="me-2" size="18">mdi-ticket</v-icon>
              صدور بلیت
            </v-btn>
          </div>
        </div>
      </div>

      <!-- System health / logs / shortcuts -->
      <div class="secondary-grid">
        <div class="mini-card">
          <div class="mini-header">
            <div class="mini-title">
              <v-icon size="18">mdi-shield-lock</v-icon>
              سلامت سیستم
            </div>
            <span class="pill-badge">پایدار</span>
          </div>
          <div class="health-grid">
            <div class="health-item">
              <span class="label">آخرین پشتیبان</span>
              <span class="value">۲۳:۴۵</span>
            </div>
            <div class="health-item">
              <span class="label">وضعیت سرور</span>
              <span class="value">سبز</span>
            </div>
            <div class="health-item">
              <span class="label">تاخیر شبکه</span>
              <span class="value">۴۲ ms</span>
            </div>
            <div class="health-item">
              <span class="label">میزان خطا</span>
              <span class="value">0.04%</span>
            </div>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-header">
            <div class="mini-title">
              <v-icon size="18">mdi-history</v-icon>
              گزارش فعالیت و ممیزی
            </div>
            <span class="pill-badge">Audit</span>
          </div>
          <div class="audit-list">
            <div
              v-for="log in [
                { title: 'پرداخت جایزه دور ۱۲', actor: 'لیلا حیدری', time: '۵ دقیقه پیش', icon: 'mdi-cash-refund' },
                { title: 'افزودن عضو جدید', actor: 'سجاد رضوی', time: '۳۴ دقیقه پیش', icon: 'mdi-account-plus' },
                { title: 'تغییر سقف جایزه', actor: 'مدیر سیستم', time: 'دیروز', icon: 'mdi-shield-key' },
              ]"
              :key="log.title"
              class="audit-row"
            >
              <v-avatar size="34" :style="{ background: 'var(--accent-weak)' }">
                <v-icon :style="{ color: 'var(--accent-strong)' }">{{ log.icon }}</v-icon>
              </v-avatar>
              <div class="audit-meta">
                <span class="audit-title">{{ log.title }}</span>
                <span>{{ log.actor }}</span>
                <span class="audit-time">{{ log.time }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mini-card">
          <div class="mini-header">
            <div class="mini-title">
              <v-icon size="18">mdi-view-dashboard-outline</v-icon>
              میانبرهای مدیر
            </div>
            <span class="pill-badge">سریع</span>
          </div>
          <div class="shortcut-grid">
            <button class="shortcut-btn">
              <v-icon size="18" :style="{ color: 'var(--accent)' }">mdi-trophy</v-icon>
              <span class="shortcut-label">قرعه‌کشی جدید</span>
              <span class="shortcut-meta">تعریف دوره و بودجه</span>
            </button>
            <button class="shortcut-btn">
              <v-icon size="18" :style="{ color: 'var(--accent)' }">mdi-bank-transfer</v-icon>
              <span class="shortcut-label">افزودن تراکنش</span>
              <span class="shortcut-meta">واریز، برداشت، کارمزد</span>
            </button>
            <button class="shortcut-btn">
              <v-icon size="18" :style="{ color: 'var(--accent)' }">mdi-cash-multiple</v-icon>
              <span class="shortcut-label">پرداخت جایزه</span>
              <span class="shortcut-meta">صدور رسید و اعلان</span>
            </button>
            <button class="shortcut-btn">
              <v-icon size="18" :style="{ color: 'var(--accent)' }">mdi-account-lock</v-icon>
              <span class="shortcut-label">کنترل دسترسی</span>
              <span class="shortcut-meta">نقش‌ها و مجوزها</span>
            </button>
          </div>
        </div>
      </div>

      <!-- DataTable Section -->
      <div class="datatable-section">
        <PremiumDataTable
          :headers="headers"
          :items="dataTable.filteredItems.value"
          v-model:search="dataTable.search.value"
          v-model:items-per-page="dataTable.itemsPerPage.value"
          v-model:selected-items="crud.selectedItems.value"
          :loading="crud.loading.value"
          show-select
          title="لیست اعضا و مشارکت‌ها"
          icon="mdi-account-group"
          @create="handleCreate"
          @view="crud.openView"
          @edit="handleEdit"
          @delete="crud.openDelete"
          @delete-selected="crud.openBulkDelete"
          @export="handleExport"
        >
            <!-- Custom filters slot -->
            <template #filters>
              <v-text-field
                v-model="dataTable.search.value"
                density="compact"
                placeholder="جستجو در اعضا..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                hide-details
                clearable
                class="search-field"
              />
              
              <v-select
                :model-value="dataTable.filters.value.status"
                @update:model-value="dataTable.setFilter('status', $event)"
                :items="[
                  { title: 'همه', value: null },
                  { title: 'فعال', value: 'فعال' },
                  { title: 'غیرفعال', value: 'غیرفعال' },
                  { title: 'معلق', value: 'معلق' }
                ]"
                density="compact"
                placeholder="فیلتر وضعیت"
                variant="outlined"
                hide-details
                clearable
                class="status-filter"
              />

              <v-select
                v-model="dataTable.itemsPerPage.value"
                :items="[5, 10, 25, 50, 100]"
                density="compact"
                variant="outlined"
                hide-details
                class="per-page-select"
              />
            </template>

            <!-- Custom item templates -->
            <!-- Custom item templates -->
            <template v-slot:item.id="{ item }">
              <v-chip size="small" variant="tonal" :style="{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }">
                {{ item.id }}
              </v-chip>
            </template>

            <template v-slot:item.name="{ item }">
              <div class="member-cell">
                <v-avatar size="32" :style="{ background: 'var(--accent-weak)', color: 'var(--accent-strong)' }" class="me-2">
                  <span>{{ item.name.charAt(0) }}</span>
                </v-avatar>
                <div>
                  <div class="member-name">{{ item.name }}</div>
                  <div class="member-email">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <template v-slot:item.totalContributions="{ item }">
              <strong class="contribution-amount">{{ formatCurrency(item.totalContributions) }}</strong>
            </template>

            <template v-slot:item.tickets="{ item }">
              <v-chip size="small" variant="tonal" :style="{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }">
                <v-icon start size="16">mdi-ticket</v-icon>
                {{ item.tickets }}
              </v-chip>
            </template>

            <template v-slot:item.lastPayment="{ item }">
              <div class="payment-date">
                <v-icon size="16" class="me-1">mdi-calendar</v-icon>
                {{ formatDate(item.lastPayment) }}
              </div>
            </template>

            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="flat"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template v-slot:footer="{ items }">
              <div class="table-footer">
                <div class="footer-info">
                  مجموع: {{ items.length }} عضو
                </div>
              </div>
            </template>
          </PremiumDataTable>

          <!-- Form Dialog (Create / Edit) -->
          <CrudFormDialog
            v-model="crud.dialogForm.value"
            :item="crud.formItem.value"
            :is-edit="crud.isEdit.value"
            :loading="crud.loading.value"
            :title="crud.isEdit.value ? 'ویرایش عضو' : 'افزودن عضو جدید'"
            @save="handleSave"
          >
            <template #form="{ item }">
              <v-row dense>
                <v-col cols="12" md="6">
                  <v-text-field v-model="item.name" :rules="[required]" label="نام و نام خانوادگی" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="item.email" :rules="[required]" label="ایمیل" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="item.nationalId" :rules="[required]" label="کد ملی" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="item.phone" :rules="[required]" label="شماره تماس" variant="outlined" density="compact" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="item.totalContributions" :rules="[required, numeric]" label="مجموع واریزی‌ها (﷼)" variant="outlined" density="compact" type="number" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="item.tickets" :rules="[required, numeric]" label="تعداد بلیت" variant="outlined" density="compact" type="number" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="formLastPaymentStr" :rules="[required]" label="آخرین پرداخت" variant="outlined" density="compact" type="date" />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select v-model="item.status" :items="['فعال','غیرفعال','معلق']" label="وضعیت" variant="outlined" density="compact" />
                </v-col>
              </v-row>
            </template>
          </CrudFormDialog>

          <!-- View Dialog -->
          <CrudViewDialog
            v-model="crud.dialogView.value"
            :item="crud.viewItem.value"
            title="جزئیات عضو"
          >
            <template #content="{ item }">
              <v-list density="compact">
                <v-list-item title="نام" :subtitle="item.name" />
                <v-list-item title="ایمیل" :subtitle="item.email" />
                <v-list-item title="کد ملی" :subtitle="item.nationalId" />
                <v-list-item title="تلفن" :subtitle="item.phone" />
                <v-list-item title="مجموع واریزی‌ها" :subtitle="formatCurrency(item.totalContributions)" />
                <v-list-item title="تعداد بلیت" :subtitle="String(item.tickets)" />
                <v-list-item title="آخرین پرداخت" :subtitle="formatDate(item.lastPayment)" />
                <v-list-item title="وضعیت" :subtitle="item.status" />
              </v-list>
            </template>
          </CrudViewDialog>

          <!-- Delete Confirm Dialog -->
          <CrudDeleteDialog
            v-model="crud.dialogDelete.value"
            :item="crud.deleteItem.value"
            :loading="crud.loading.value"
            @confirm="crud.confirmDelete"
          >
            <template #message="{ item }">
              <template v-if="item">
                آیا از حذف
                <strong>{{ item.name }}</strong>
                اطمینان دارید؟ این عملیات قابل بازگشت نیست.
              </template>
            </template>
          </CrudDeleteDialog>

          <!-- Bulk Delete Confirm Dialog -->
          <CrudBulkDeleteDialog
            v-model="crud.dialogBulkDelete.value"
            :count="crud.selectedItems.value.length"
            :loading="crud.loading.value"
            @confirm="crud.confirmBulkDelete"
          />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  position: relative;
  padding: 28px;
  background: transparent;
}

.bg-decoration { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
.circle { position: absolute; border-radius: 50%; filter: blur(40px); opacity: 0.16; }
.circle-1 { width: 520px; height: 520px; background: var(--accent-weak); top: -140px; right: -120px; }
.circle-2 { width: 380px; height: 380px; background: var(--bg-tertiary); bottom: -120px; left: -80px; opacity: 0.12; }

.dashboard-content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 22px; }

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  position: relative;
  padding: 18px;
  border-radius: 18px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 12px;
  align-items: center;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 0%, rgba(63, 178, 122, 0.08) 100%);
  pointer-events: none;
}

.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

.stat-icon { width: 50px; height: 50px; border-radius: 14px; background: var(--accent-weak); display: flex; align-items: center; justify-content: center; color: var(--accent-strong); box-shadow: inset 0 0 0 1px var(--border-color); }
.stat-info { display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-size: 0.9rem; color: var(--text-secondary); }
.stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
.stat-value-sm { font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
.stat-trend { display: inline-flex; align-items: center; gap: 4px; padding: 6px 10px; border-radius: 12px; background: var(--bg-secondary); color: var(--accent-strong); font-weight: 700; }
.stat-badge { padding: 6px 10px; border-radius: 12px; background: var(--bg-secondary); color: var(--text-secondary); font-weight: 700; }

.content-grid { display: grid; grid-template-columns: 1.35fr 1fr; gap: 18px; }

.panel-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-sm);
}

.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.panel-title { display: flex; align-items: center; gap: 10px; font-weight: 800; color: var(--text-primary); }
.title-icon { width: 36px; height: 36px; background: var(--accent-weak); color: var(--accent-strong); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
.title-icon.gold { background: #fff2dc; color: #f08a24; }
.panel-stat { font-weight: 700; color: var(--accent-strong); }
.stat-prefix { color: var(--text-muted); margin-left: 4px; }

.transactions-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.tx-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 14px; transition: background 0.2s ease, transform 0.2s ease; }
.tx-item:hover { background: var(--bg-tertiary); transform: translateY(-2px); }
.tx-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--accent-weak); color: var(--accent-strong); }
.tx-avatar.expense { background: #ffebee; color: #e53935; }
.tx-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.tx-name { font-weight: 700; color: var(--text-primary); }
.tx-time { color: var(--text-muted); font-size: 0.85rem; }
.tx-amount { font-weight: 800; color: var(--accent-strong); }
.tx-amount.expense { color: #e53935; }

.view-all-btn { width: 100%; padding: 12px; border-radius: 12px; border: 1px dashed var(--border-color); background: var(--bg-primary); color: var(--accent-strong); font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
.view-all-btn:hover { border-color: var(--accent); background: var(--accent-weak); }

.schedule-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.schedule-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 14px; background: var(--bg-secondary); border: 1px solid var(--border-color); }
.schedule-item.highlight { background: var(--accent-weak); border-color: var(--accent); }
.schedule-icon { width: 40px; height: 40px; border-radius: 12px; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 0 1px var(--border-color); }
.schedule-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.schedule-title { color: var(--text-muted); font-size: 0.85rem; }
.schedule-date { color: var(--text-primary); font-weight: 700; }

.panel-actions { display: flex; gap: 10px; }
.action-btn { flex: 1; border-radius: 12px !important; }

.secondary-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; }
.mini-card { border-radius: 14px; padding: 16px; background: var(--bg-primary); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); display: flex; flex-direction: column; gap: 10px; }
.mini-header { display: flex; align-items: center; justify-content: space-between; }
.mini-title { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--text-primary); }
.pill-badge { padding: 4px 8px; border-radius: 10px; background: var(--bg-secondary); color: var(--text-secondary); font-weight: 700; }
.health-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.health-item { padding: 10px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.health-item .label { color: var(--text-secondary); font-size: 0.85rem; }
.health-item .value { font-weight: 800; color: var(--text-primary); }

.audit-list { display: flex; flex-direction: column; gap: 10px; }
.audit-row { padding: 12px; border-radius: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; gap: 10px; align-items: center; }
.audit-meta { display: flex; flex-direction: column; gap: 2px; color: var(--text-secondary); }
.audit-title { font-weight: 700; color: var(--text-primary); }
.audit-time { color: var(--text-muted); font-size: 0.85rem; }

.shortcut-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.shortcut-btn { padding: 12px; border-radius: 12px; border: 1px solid var(--border-color); background: var(--bg-secondary); display: flex; flex-direction: column; gap: 8px; align-items: flex-start; cursor: pointer; transition: all 0.2s; }
.shortcut-btn:hover { background: var(--accent-weak); border-color: var(--accent); box-shadow: var(--shadow-sm); }
.shortcut-label { font-weight: 800; color: var(--text-primary); }
.shortcut-meta { color: var(--text-muted); font-size: 0.85rem; }

.datatable-section { margin-top: 4px; }
.search-field { flex: 1; min-width: 250px; }
.status-filter { width: 180px; }
.per-page-select { width: 100px; }
.member-cell { display: flex; align-items: center; gap: 8px; }
.member-name { font-weight: 700; color: var(--text-primary); }
.member-email { font-size: 0.85rem; color: var(--text-muted); }
.contribution-amount { color: var(--accent-strong); font-size: 0.95rem; }
.payment-date { display: flex; align-items: center; color: var(--text-secondary); font-size: 0.9rem; }
.table-footer { padding: 12px 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
.footer-info { font-weight: 700; color: var(--text-secondary); }

@media (max-width: 1200px) {
  .dashboard-page { padding: 20px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .content-grid { grid-template-columns: 1fr; }
  .secondary-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .secondary-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .dashboard-page { padding: 16px; }
  .stats-grid { grid-template-columns: 1fr; gap: 12px; }
  .stat-card { padding: 16px; }
  .content-grid { gap: 14px; }
  .panel-card { padding: 14px; }
  .search-field, .status-filter, .per-page-select { width: 100%; }
  .panel-actions { flex-direction: column; }
  .action-btn { width: 100%; }
}
</style>
