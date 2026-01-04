import { ref, computed, onMounted } from 'vue'

export type LotteryType = 'weekly' | 'monthly'
export type LotteryStatus = 'active' | 'completed' | 'suspended'
export type LotteryResult = 'winner' | 'not_winner' | 'replaced'
export type PaymentStatus = 'paid' | 'missed'

export interface LotteryItem {
  id: number
  name: string
  type: LotteryType
  status: LotteryStatus
  tickets: number
  joinDate: string
  result: LotteryResult
  chanceMultiplier: number
  payments: Array<{ id: number; date: string; amount: number; status: PaymentStatus; note?: string }>
  schedule: Array<{ id: number; dueDate: string; amount: number }>
  penalties: Array<{ id: number; date: string; amount: number; reason: string }>
  bonuses: Array<{ id: number; date: string; amount: number; reason: string }>
}

export const useLotteries = (memberId: number) => {
  const lotteries = ref<LotteryItem[]>([])
  const loadingLotteries = ref(true)

  const lotteryFilters = ref<{ name: string; type: LotteryType | 'all'; status: LotteryStatus | 'all'; result: LotteryResult | 'all' }>({
    name: '',
    type: 'all',
    status: 'all',
    result: 'all',
  })

  const filteredLotteries = computed(() => {
    return lotteries.value.filter(l =>
      (!lotteryFilters.value.name || l.name.includes(lotteryFilters.value.name)) &&
      (lotteryFilters.value.type === 'all' || l.type === lotteryFilters.value.type) &&
      (lotteryFilters.value.status === 'all' || l.status === lotteryFilters.value.status) &&
      (lotteryFilters.value.result === 'all' || l.result === lotteryFilters.value.result)
    )
  })

  onMounted(() => {
    const baseSeed = memberId % 7
    lotteries.value = Array.from({ length: 6 + baseSeed }, (_, i) => {
      const id = 1000 + i
      const type: LotteryType = i % 2 === 0 ? 'monthly' : 'weekly'
      const status: LotteryStatus = i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'active' : 'suspended'
      const result: LotteryResult = i % 3 === 0 ? 'winner' : i % 3 === 1 ? 'not_winner' : 'replaced'
      const tickets = (i + 1) * 2
      const chanceMultiplier = 1 + (i % 3)
      const payments = Array.from({ length: 4 }, (_, p) => ({ id: id * 10 + p, date: `۱۴۰۴/۰${(p + 1)}`, amount: 1500000, status: (p % 3 === 0 ? 'missed' : 'paid') as PaymentStatus, note: p % 3 === 0 ? 'تاخیر' : '—' }))
      const schedule = Array.from({ length: 4 }, (_, s) => ({ id: id * 100 + s, dueDate: `۱۴۰۴/۱${(s)}`, amount: 1500000 }))
      const penalties = payments.filter(p => p.status === 'missed').map((p, k) => ({ id: id * 1000 + k, date: p.date, amount: 150000, reason: 'جریمه دیرکرد' }))
      const bonuses = result === 'winner' ? [{ id: id * 2000, date: '۱۴۰۴/۱۲/۰۱', amount: 500000, reason: 'پاداش وفاداری' }] : []
      return {
        id,
        name: `قرعه‌کشی ${i + 1}`,
        type,
        status,
        tickets,
        joinDate: `۱۴۰۴/۰${(i % 9) + 1}/۰${(i % 3) + 1}`,
        result,
        chanceMultiplier,
        payments,
        schedule,
        penalties,
        bonuses,
      }
    })
    setTimeout(() => loadingLotteries.value = false, 300)
  })

  return {
    lotteries,
    loadingLotteries,
    lotteryFilters,
    filteredLotteries,
  }
}