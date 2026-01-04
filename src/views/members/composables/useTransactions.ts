import { ref, computed, onMounted } from 'vue'

export type TransactionType = 'installment' | 'refund' | 'penalty'
export type TransactionStatus = 'paid' | 'pending' | 'failed'

export interface TransactionItem {
  id: number
  lotteryId?: number
  date: string
  amount: number
  type: TransactionType
  status: TransactionStatus
  note?: string
}

export const useTransactions = (memberId: number, lotteries: any[]) => {
  const transactions = ref<TransactionItem[]>([])
  const loadingTransactions = ref(true)

  const transactionFilters = ref<{ lotteryId: number | 'all'; type: TransactionType | 'all'; status: TransactionStatus | 'all' }>({
    lotteryId: 'all',
    type: 'all',
    status: 'all',
  })

  const filteredTransactions = computed(() => {
    return transactions.value.filter(t =>
      (transactionFilters.value.lotteryId === 'all' || t.lotteryId === transactionFilters.value.lotteryId) &&
      (transactionFilters.value.type === 'all' || t.type === transactionFilters.value.type) &&
      (transactionFilters.value.status === 'all' || t.status === transactionFilters.value.status)
    )
  })

  const totals = computed(() => {
    const income = filteredTransactions.value.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0)
    const deductions = filteredTransactions.value.filter(t => t.type !== 'refund').reduce((sum, t) => sum + Math.abs(t.amount), 0)
    const net = income - deductions
    return { income, deductions, net }
  })

  onMounted(() => {
    const baseSeed = memberId % 7
    transactions.value = Array.from({ length: 14 + baseSeed }, (_, i) => {
      const tType: TransactionType = i % 5 === 0 ? 'refund' : i % 3 === 0 ? 'penalty' : 'installment'
      const status: TransactionStatus = i % 4 === 0 ? 'pending' : i % 5 === 0 ? 'failed' : 'paid'
      const amount = tType === 'refund' ? 2000000 : tType === 'penalty' ? -150000 : -1500000
      return {
        id: 3000 + i,
        lotteryId: lotteries[i % lotteries.length]?.id,
        date: `۱۴۰۴/۱${(i % 9)}/۰${(i % 3) + 1}`,
        amount,
        type: tType,
        status,
        note: tType === 'penalty' ? 'دیرکرد' : tType === 'installment' ? 'قسط ماهانه' : 'بازگشت'
      }
    })
    setTimeout(() => loadingTransactions.value = false, 450)
  })

  return {
    transactions,
    loadingTransactions,
    transactionFilters,
    filteredTransactions,
    totals,
  }
}