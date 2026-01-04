<script setup lang="ts">
import { computed } from 'vue'
import { useLotteries, type LotteryItem } from '../../views/members/composables/useLotteries'
import { useTransactions } from '../../views/members/composables/useTransactions'

const props = defineProps<{ memberId: number }>()

const { lotteries } = useLotteries(props.memberId)
const { filteredTransactions, transactionFilters, loadingTransactions, totals } = useTransactions(props.memberId, lotteries.value)

const amountClass = (t: { type: 'installment'|'refund'|'penalty' }) => t.type === 'refund' ? 'amt-income' : 'amt-deduction'
const typeLabel = (t: 'installment'|'refund'|'penalty') => t === 'installment' ? 'قسط' : t === 'refund' ? 'بازگشت' : 'جریمه'
const statusLabel = (s: 'paid'|'pending'|'failed') => s === 'paid' ? 'پرداخت شده' : s === 'pending' ? 'در انتظار' : 'ناموفق'
const statusColor = (s: 'paid'|'pending'|'failed') => s === 'paid' ? 'success' : s === 'pending' ? 'warning' : 'error'

const lotteryItems = computed(() => [{ title: 'همه', value: 'all' as const }, ...lotteries.value.map((l: LotteryItem) => ({ title: l.name, value: l.id }))])
const getLotteryName = (id?: number) => lotteries.value.find((l: LotteryItem) => l.id === id)?.name || '—'
</script>

<template>
  <div class="transactions-tab" dir="rtl">
    <div class="filters">
      <v-select :items="lotteryItems" v-model="transactionFilters.lotteryId" label="قرعه‌کشی" variant="outlined" density="compact" hide-details />
      <v-select :items="[
        { title: 'همه', value: 'all' },
        { title: 'قسط', value: 'installment' },
        { title: 'بازگشت', value: 'refund' },
        { title: 'جریمه', value: 'penalty' },
      ]" v-model="transactionFilters.type" label="نوع تراکنش" variant="outlined" density="compact" hide-details />
      <v-select :items="[
        { title: 'همه', value: 'all' },
        { title: 'پرداخت شده', value: 'paid' },
        { title: 'در انتظار', value: 'pending' },
        { title: 'ناموفق', value: 'failed' },
      ]" v-model="transactionFilters.status" label="وضعیت پرداخت" variant="outlined" density="compact" hide-details />
    </div>

    <div class="summary">
      <v-card class="sum-card" elevation="2"><span>درآمد</span><strong>{{ new Intl.NumberFormat('fa-IR').format(totals.income) }}</strong></v-card>
      <v-card class="sum-card" elevation="2"><span>کسرها</span><strong>{{ new Intl.NumberFormat('fa-IR').format(totals.deductions) }}</strong></v-card>
      <v-card class="sum-card" elevation="2"><span>خالص</span><strong>{{ new Intl.NumberFormat('fa-IR').format(totals.net) }}</strong></v-card>
    </div>

    <v-alert v-if="loadingTransactions" type="info" variant="tonal" class="mb-2">در حال بارگذاری...</v-alert>
    <v-alert v-else-if="filteredTransactions.length === 0" type="warning" variant="tonal" class="mb-2">تراکنشی یافت نشد.</v-alert>

    <v-table v-else class="elevation-0">
      <thead>
        <tr>
          <th>تاریخ</th>
          <th>مبلغ</th>
          <th>نوع</th>
          <th>وضعیت</th>
          <th>قرعه‌کشی</th>
          <th>توضیح</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="t in filteredTransactions" :key="t.id">
          <td>{{ t.date }}</td>
          <td :class="amountClass(t)">{{ new Intl.NumberFormat('fa-IR').format(Math.abs(t.amount)) }}</td>
          <td>
            <v-chip :color="t.type==='refund' ? 'success' : t.type==='penalty' ? 'error' : 'default'" variant="tonal">{{ typeLabel(t.type) }}</v-chip>
          </td>
          <td>
            <v-chip :color="statusColor(t.status)" variant="tonal">{{ statusLabel(t.status) }}</v-chip>
          </td>
          <td>{{ getLotteryName(t.lotteryId) }}</td>
          <td>{{ t.note || '—' }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<style scoped>
.transactions-tab { direction: rtl; }
.filters { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
.summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px; }
.sum-card { display: flex; align-items: center; justify-content: space-between; padding: 8px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--bg-secondary); }
.amt-income { color: #2e7d32; font-weight: 700; }
.amt-deduction { color: #c62828; font-weight: 700; }
@media (max-width: 900px){ .filters { grid-template-columns: 1fr; } .summary { grid-template-columns: 1fr; } }
</style>
