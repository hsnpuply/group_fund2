<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Fake summary metrics for the lottery group fund
const groupName = ref('گروه صندوق قرعه‌کشی')
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

const goSettings = () => router.push({ name: 'Settings' })
</script>

<template>
  <div class="dashboard-page">
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <v-container class="py-8" fluid>
      <div class="header">
        <div class="title-wrap">
          <v-icon size="42" color="#4caf50">mdi-chart-areaspline</v-icon>
          <div class="titles">
            <h1 class="title">داشبورد مالی</h1>
            <p class="subtitle">{{ groupName }}</p>
          </div>
        </div>
        <div class="actions">
          <v-btn color="#4caf50" class="elevate" variant="flat" @click="goSettings">
            <v-icon class="me-2">mdi-cog</v-icon>
            تنظیمات
          </v-btn>
        </div>
      </div>

      <v-row class="mt-2" dense>
        <v-col cols="12" md="3">
          <v-card class="metric-card gradient-green" elevation="8">
            <div class="metric-icon">
              <v-icon size="32">mdi-safe</v-icon>
            </div>
            <div class="metric-content">
              <div class="metric-label">موجودی صندوق</div>
              <div class="metric-value" dir="ltr">﷼ {{ formattedFund }}</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="metric-card gradient-blue" elevation="8">
            <div class="metric-icon">
              <v-icon size="32">mdi-account-group</v-icon>
            </div>
            <div class="metric-content">
              <div class="metric-label">اعضا</div>
              <div class="metric-value">{{ members }}</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="metric-card gradient-purple" elevation="8">
            <div class="metric-icon">
              <v-icon size="32">mdi-ticket-confirmation</v-icon>
            </div>
            <div class="metric-content">
              <div class="metric-label">بلیت‌های فعال</div>
              <div class="metric-value">{{ activeTickets }}</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="3">
          <v-card class="metric-card gradient-orange" elevation="8">
            <div class="metric-icon">
              <v-icon size="32">mdi-calendar-clock</v-icon>
            </div>
            <div class="metric-content">
              <div class="metric-label">قرعه‌کشی بعدی</div>
              <div class="metric-value">{{ formattedNextDraw }}</div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-2" dense>
        <v-col cols="12" md="7">
          <v-card elevation="8" class="panel-card">
            <div class="panel-header">
              <div class="panel-title">
                <v-icon class="me-2">mdi-cash-plus</v-icon>
                واریزی‌های امروز
              </div>
              <div class="panel-stat" dir="ltr">﷼ {{ formattedContribToday }}</div>
            </div>
            <div class="transactions">
              <div v-for="t in transactions" :key="t.id" class="tx-item">
                <div class="tx-left">
                  <div class="tx-avatar">
                    <v-icon>mdi-account</v-icon>
                  </div>
                  <div class="tx-meta">
                    <div class="tx-name">{{ t.name }}</div>
                    <div class="tx-time">{{ t.time }}</div>
                  </div>
                </div>
                <div class="tx-right" :class="{neg: t.amount < 0}">
                  <v-icon class="me-1" size="18">{{ t.amount < 0 ? 'mdi-arrow-down' : 'mdi-arrow-up' }}</v-icon>
                  <span dir="ltr">﷼ {{ new Intl.NumberFormat('fa-IR').format(Math.abs(t.amount)) }}</span>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="5">
          <v-card elevation="8" class="panel-card">
            <div class="panel-header">
              <div class="panel-title">
                <v-icon class="me-2">mdi-trophy</v-icon>
                برنامه قرعه‌کشی
              </div>
            </div>
            <div class="schedule">
              <div class="schedule-item">
                <div class="schedule-date">{{ formattedNextDraw }}</div>
                <div class="schedule-sub">پرداخت جایزه دور بعد</div>
              </div>
              <div class="schedule-item">
                <div class="schedule-date">هر جمعه</div>
                <div class="schedule-sub">زمان قرعه‌کشی هفتگی</div>
              </div>
              <div class="schedule-item">
                <div class="schedule-date">سقف جایزه: ۲۰,۰۰۰,۰۰۰ ﷼</div>
                <div class="schedule-sub">براساس موجودی صندوق</div>
              </div>
            </div>
            <div class="panel-actions">
              <v-btn color="#4caf50" class="elevate" variant="flat">
                <v-icon class="me-2">mdi-cash</v-icon>
                ثبت واریز
              </v-btn>
              <v-btn class="ms-2 elevate" variant="tonal" color="#4caf50">
                <v-icon class="me-2">mdi-ticket</v-icon>
                ثبت بلیت
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8faf8 0%, #e8f5e9 100%);
  position: relative;
}

.bg-decoration { position: absolute; inset: 0; pointer-events: none; }
.circle { position: absolute; border-radius: 50%; opacity: 0.08; }
.circle-1 { width: 520px; height: 520px; background: #4caf50; top: -120px; right: -120px; }
.circle-2 { width: 360px; height: 360px; background: #81c784; bottom: -80px; left: -80px; }
.circle-3 { width: 240px; height: 240px; background: #a5d6a7; top: 40%; left: 6%; }

.header { display: flex; align-items: center; justify-content: space-between; gap: 16px; direction: rtl; }
.title-wrap { display: flex; align-items: center; gap: 14px; }
.titles .title { font-size: 1.75rem; font-weight: 700; color: #1a1a1a; }
.titles .subtitle { color: #666; margin-top: 4px; }
.actions .elevate { box-shadow: 0 8px 18px rgba(76, 175, 80, 0.28); }
.actions .elevate:hover { transform: translateY(-1px); }

.metric-card { display: flex; align-items: center; gap: 16px; border-radius: 18px; padding: 18px; color: #fff; }
.metric-icon { display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 14px; background: rgba(255, 255, 255, 0.22); }
.metric-content { flex: 1; }
.metric-label { font-size: 0.95rem; opacity: 0.9; }
.metric-value { font-size: 1.35rem; font-weight: 700; }

.gradient-green { background: linear-gradient(135deg, #4caf50, #43a047); }
.gradient-blue { background: linear-gradient(135deg, #2196f3, #1e88e5); }
.gradient-purple { background: linear-gradient(135deg, #7e57c2, #673ab7); }
.gradient-orange { background: linear-gradient(135deg, #ff9800, #fb8c00); }

.panel-card { border-radius: 18px; padding: 16px; direction: rtl; }
.panel-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 4px 16px; }
.panel-title { display: flex; align-items: center; font-weight: 600; color: #1a1a1a; }
.panel-stat { font-weight: 700; color: #4caf50; }

.transactions { display: flex; flex-direction: column; gap: 12px; }
.tx-item { display: flex; align-items: center; justify-content: space-between; background: #fafafa; border-radius: 14px; padding: 12px 14px; }
.tx-left { display: flex; align-items: center; gap: 10px; }
.tx-avatar { width: 40px; height: 40px; border-radius: 12px; background: #e8f5e9; display: flex; align-items: center; justify-content: center; color: #4caf50; }
.tx-meta .tx-name { font-weight: 600; color: #1a1a1a; }
.tx-meta .tx-time { font-size: 0.85rem; color: #777; }
.tx-right { font-weight: 700; color: #4caf50; display: inline-flex; align-items: center; }
.tx-right.neg { color: #ef5350; }

.schedule { display: flex; flex-direction: column; gap: 12px; }
.schedule-item { background: #fafafa; border-radius: 14px; padding: 12px 14px; }
.schedule-date { font-weight: 600; color: #1a1a1a; }
.schedule-sub { font-size: 0.9rem; color: #777; }

.panel-actions { display: flex; align-items: center; justify-content: flex-start; padding-top: 8px; }

@media (max-width: 600px) {
  .metric-card { padding: 16px; }
  .metric-value { font-size: 1.2rem; }
}
</style>
