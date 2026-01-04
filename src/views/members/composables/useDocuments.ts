import { ref, onMounted } from 'vue'

export interface DocumentItem {
  id: number
  lotteryId?: number
  title: string
  type: 'receipt' | 'form' | 'id'
  status: 'approved' | 'pending' | 'rejected'
  url: string
}

export const useDocuments = (lotteries: any[]) => {
  const documents = ref<DocumentItem[]>([])
  const loadingDocuments = ref(true)

  onMounted(() => {
    documents.value = [
      { id: 1, lotteryId: lotteries[0]?.id, title: 'رسید پرداخت شماره ۱', type: 'receipt', status: 'approved', url: 'https://via.placeholder.com/1200x800.png?text=Receipt+1' },
      { id: 2, lotteryId: lotteries[1]?.id, title: 'رسید پرداخت شماره ۲', type: 'receipt', status: 'pending', url: 'https://via.placeholder.com/1200x800.png?text=Receipt+2' },
      { id: 3, lotteryId: lotteries[2]?.id, title: 'فرم احراز هویت', type: 'form', status: 'rejected', url: 'https://via.placeholder.com/1000x1400.png?text=KYC+Form' },
    ]
    setTimeout(() => loadingDocuments.value = false, 600)
  })

  return {
    documents,
    loadingDocuments,
  }
}