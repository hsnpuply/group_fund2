<script setup lang="ts">
import { ref } from 'vue'
import { useLotteries } from '../../views/members/composables/useLotteries'

const props = defineProps<{ memberId: number }>()

const { filteredLotteries, lotteryFilters, loadingLotteries } = useLotteries(props.memberId)

const expanded = ref<Record<number, boolean>>({})
const toggleExpand = (id: number) => expanded.value[id] = !expanded.value[id]

const formatType = (t: 'weekly' | 'monthly') => t === 'weekly' ? 'هفتگی' : 'ماهانه'
const formatStatus = (s: 'active' | 'completed' | 'suspended') => s === 'active' ? 'فعال' : s === 'completed' ? 'تکمیل‌شده' : 'تعلیق'
const formatResult = (r: 'winner' | 'not_winner' | 'replaced') => r === 'winner' ? 'برنده' : r === 'replaced' ? 'جایگزین' : 'عدم موفقیت'

</script>

<template>
  <div class="lottery-history" dir="rtl">
    <div class="filters">
      <v-text-field v-model="lotteryFilters.name" label="جستجو نام" variant="outlined" density="compact" hide-details />
      <v-select :items="[
        { title: 'همه', value: 'all' },
        { title: 'هفتگی', value: 'weekly' },
        { title: 'ماهانه', value: 'monthly' },
      ]" v-model="lotteryFilters.type" label="نوع" variant="outlined" density="compact" hide-details />
      <v-select :items="[
        { title: 'همه', value: 'all' },
        { title: 'فعال', value: 'active' },
        { title: 'تکمیل‌شده', value: 'completed' },
        { title: 'تعلیق', value: 'suspended' },
      ]" v-model="lotteryFilters.status" label="وضعیت" variant="outlined" density="compact" hide-details />
      <v-select :items="[
        { title: 'همه', value: 'all' },
        { title: 'برنده', value: 'winner' },
        { title: 'عدم موفقیت', value: 'not_winner' },
        { title: 'جایگزین', value: 'replaced' },
      ]" v-model="lotteryFilters.result" label="نتیجه" variant="outlined" density="compact" hide-details />
    </div>

    <v-alert v-if="loadingLotteries" type="info" variant="tonal" class="mb-2">در حال بارگذاری...</v-alert>
    <v-alert v-else-if="filteredLotteries.length === 0" type="warning" variant="tonal" class="mb-2">موردی یافت نشد.</v-alert>

    <div v-else class="table-wrapper">
      <v-table class="elevation-0">
        <thead>
          <tr>
            <th>نام قرعه‌کشی</th>
            <th>نوع</th>
            <th>وضعیت</th>
            <th>تعداد بلیت</th>
            <th>تاریخ عضویت</th>
            <th>نتیجه</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="l in filteredLotteries" :key="l.id">
            <tr class="clickable" @click="toggleExpand(l.id)">
              <td class="bold">{{ l.name }}</td>
              <td>{{ formatType(l.type) }}</td>
              <td>
                <v-chip :color="l.status==='active' ? 'success' : l.status==='completed' ? 'info' : 'warning'" variant="tonal">{{ formatStatus(l.status) }}</v-chip>
              </td>
              <td>{{ l.tickets }}</td>
              <td>{{ l.joinDate }}</td>
              <td>
                <v-chip :color="l.result==='winner' ? 'success' : l.result==='replaced' ? 'info' : 'default'" variant="tonal">{{ formatResult(l.result) }}</v-chip>
              </td>
              <td class="expand-icon">
                <v-icon>{{ expanded[l.id] ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
              </td>
            </tr>
            <tr v-show="expanded[l.id]">
              <td colspan="7" class="expanded">
                <div class="expanded-grid">
                  <v-card class="exp-card" elevation="2">
                    <div class="exp-title"><v-icon class="me-1">mdi-cash</v-icon> تاریخچه پرداخت</div>
                    <v-table class="elevation-0 compact">
                      <thead><tr><th>تاریخ</th><th>مبلغ</th><th>وضعیت</th><th>یادداشت</th></tr></thead>
                      <tbody>
                        <tr v-for="p in l.payments" :key="p.id">
                          <td>{{ p.date }}</td>
                          <td>{{ new Intl.NumberFormat('fa-IR').format(p.amount) }}</td>
                          <td>
                            <v-chip :color="p.status==='paid' ? 'success' : 'error'" variant="tonal">{{ p.status==='paid' ? 'پرداخت شده' : 'عدم پرداخت' }}</v-chip>
                          </td>
                          <td>{{ p.note || '—' }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card>

                  <v-card class="exp-card" elevation="2">
                    <div class="exp-title"><v-icon class="me-1">mdi-calendar-clock</v-icon> برنامه اقساط</div>
                    <div class="schedule-list">
                      <div v-for="s in l.schedule" :key="s.id" class="schedule-item">
                        <span class="date">{{ s.dueDate }}</span>
                        <span class="amount">{{ new Intl.NumberFormat('fa-IR').format(s.amount) }}</span>
                      </div>
                    </div>
                  </v-card>

                  <v-card class="exp-card" elevation="2">
                    <div class="exp-title"><v-icon class="me-1">mdi-alert-octagon</v-icon> جریمه‌ها / پاداش‌ها</div>
                    <div class="chips">
                      <div class="chips-section">
                        <span class="label">جریمه‌ها:</span>
                        <div class="chip-list">
                          <v-chip v-for="pen in l.penalties" :key="pen.id" color="error" variant="tonal" class="me-1 mb-1">{{ pen.date }} • {{ new Intl.NumberFormat('fa-IR').format(pen.amount) }} • {{ pen.reason }}</v-chip>
                          <span v-if="l.penalties.length===0" class="muted">بدون جریمه</span>
                        </div>
                      </div>
                      <div class="chips-section">
                        <span class="label">پاداش‌ها:</span>
                        <div class="chip-list">
                          <v-chip v-for="bon in l.bonuses" :key="bon.id" color="success" variant="tonal" class="me-1 mb-1">{{ bon.date }} • {{ new Intl.NumberFormat('fa-IR').format(bon.amount) }} • {{ bon.reason }}</v-chip>
                          <span v-if="l.bonuses.length===0" class="muted">بدون پاداش</span>
                        </div>
                      </div>
                    </div>
                  </v-card>

                  <v-card class="exp-card" elevation="2">
                    <div class="exp-title"><v-icon class="me-1">mdi-star-circle</v-icon> ضریب شانس</div>
                    <div class="chance">ضریب اعمال‌شده: <strong>{{ l.chanceMultiplier }}x</strong></div>
                  </v-card>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<style scoped>
.lottery-history { direction: rtl; }
.filters { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; }
.table-wrapper :deep(table) { width: 100%; }
.bold { font-weight: 700; }
.clickable { cursor: pointer; }
.expand-icon { width: 36px; text-align: center; }
.expanded { background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 10px; padding: 12px; }
.expanded-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
.exp-card { border: 1px solid var(--border-color); background: var(--bg-primary); border-radius: 12px; }
.exp-title { padding: 8px 12px; border-bottom: 1px solid var(--border-color); font-weight: 700; }
.compact th, .compact td { padding: 6px !important; }
.schedule-list { padding: 8px 12px; display: grid; gap: 8px; }
.schedule-item { display: flex; align-items: center; justify-content: space-between; }
.chips { padding: 8px 12px; }
.chips-section { margin-bottom: 8px; }
.label { font-weight: 700; margin-inline-end: 8px; }
.chip-list { display: flex; flex-wrap: wrap; }
.muted { color: var(--text-secondary); }
.chance { padding: 12px; }

@media (max-width: 900px){ .filters { grid-template-columns: 1fr 1fr; } .expanded-grid { grid-template-columns: 1fr; } }
</style>
