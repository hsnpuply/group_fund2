import { ref, computed, onMounted } from 'vue'

export type LotteryType = 'weekly' | 'monthly'
export type LotteryStatus = 'active' | 'completed' | 'suspended'
export type LotteryResult = 'winner' | 'not_winner' | 'replaced'
export type PaymentStatus = 'paid' | 'missed'
export type TransactionType = 'installment' | 'refund' | 'penalty'
export type TransactionStatus = 'paid' | 'pending' | 'failed'

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

export interface TransactionItem {
	id: number
	lotteryId?: number
	date: string
	amount: number
	type: TransactionType
	status: TransactionStatus
	note?: string
}

export interface DocumentItem {
	id: number
	lotteryId?: number
	title: string
	type: 'receipt' | 'form' | 'id'
	status: 'approved' | 'pending' | 'rejected'
	url: string
}

export const useMemberFinancial = (memberId: number) => {
	const lotteries = ref<LotteryItem[]>([])
	const transactions = ref<TransactionItem[]>([])
	const documents = ref<DocumentItem[]>([])

	const loadingLotteries = ref(true)
	const loadingTransactions = ref(true)
	const loadingDocuments = ref(true)

	const lotteryFilters = ref<{ name: string; type: LotteryType | 'all'; status: LotteryStatus | 'all'; result: LotteryResult | 'all' }>({
		name: '',
		type: 'all',
		status: 'all',
		result: 'all',
	})

	const transactionFilters = ref<{ lotteryId: number | 'all'; type: TransactionType | 'all'; status: TransactionStatus | 'all' }>({
		lotteryId: 'all',
		type: 'all',
		status: 'all',
	})

	const filteredLotteries = computed(() => {
		return lotteries.value.filter(l =>
			(!lotteryFilters.value.name || l.name.includes(lotteryFilters.value.name)) &&
			(lotteryFilters.value.type === 'all' || l.type === lotteryFilters.value.type) &&
			(lotteryFilters.value.status === 'all' || l.status === lotteryFilters.value.status) &&
			(lotteryFilters.value.result === 'all' || l.result === lotteryFilters.value.result)
		)
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
		// Mock data generation based on memberId
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

		transactions.value = Array.from({ length: 14 + baseSeed }, (_, i) => {
			const tType: TransactionType = i % 5 === 0 ? 'refund' : i % 3 === 0 ? 'penalty' : 'installment'
			const status: TransactionStatus = i % 4 === 0 ? 'pending' : i % 5 === 0 ? 'failed' : 'paid'
			const amount = tType === 'refund' ? 2000000 : tType === 'penalty' ? -150000 : -1500000
			return {
				id: 3000 + i,
				lotteryId: lotteries.value[i % lotteries.value.length]?.id,
				date: `۱۴۰۴/۱${(i % 9)}/۰${(i % 3) + 1}`,
				amount,
				type: tType,
				status,
				note: tType === 'penalty' ? 'دیرکرد' : tType === 'installment' ? 'قسط ماهانه' : 'بازگشت'
			}
		})

		documents.value = [
			{ id: 1, lotteryId: lotteries.value[0]?.id, title: 'رسید پرداخت شماره ۱', type: 'receipt', status: 'approved', url: 'https://via.placeholder.com/1200x800.png?text=Receipt+1' },
			{ id: 2, lotteryId: lotteries.value[1]?.id, title: 'رسید پرداخت شماره ۲', type: 'receipt', status: 'pending', url: 'https://via.placeholder.com/1200x800.png?text=Receipt+2' },
			{ id: 3, lotteryId: lotteries.value[2]?.id, title: 'فرم احراز هویت', type: 'form', status: 'rejected', url: 'https://via.placeholder.com/1000x1400.png?text=KYC+Form' },
		]

		// Simulate loading
		setTimeout(() => loadingLotteries.value = false, 300)
		setTimeout(() => loadingTransactions.value = false, 450)
		setTimeout(() => loadingDocuments.value = false, 600)
	})

	return {
		lotteries,
		transactions,
		documents,
		loadingLotteries,
		loadingTransactions,
		loadingDocuments,
		lotteryFilters,
		transactionFilters,
		filteredLotteries,
		filteredTransactions,
		totals,
	}
}
