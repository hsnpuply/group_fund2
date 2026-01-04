import { ref, computed, watch } from 'vue'

export type NotificationType = 'success' | 'warning' | 'error' | 'info' | 'transaction' | 'system'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  avatar?: string
  metadata?: Record<string, any>
}

const STORAGE_KEY = 'app_notifications'

// Singleton state
const notifications = ref<Notification[]>([])
const isInitialized = ref(false)

// Generate unique ID
const generateId = () => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

export function useNotifications() {
  // Computed properties
  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)
  const hasUnread = computed(() => unreadCount.value > 0)
  
  const unreadNotifications = computed(() => 
    notifications.value.filter(n => !n.read).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  )
  
  const readNotifications = computed(() => 
    notifications.value.filter(n => n.read).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  )

  const sortedNotifications = computed(() => 
    [...notifications.value].sort((a, b) => {
      // Unread first, then by priority, then by date
      if (a.read !== b.read) return a.read ? 1 : -1
      const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    })
  )

  const groupedByType = computed(() => {
    const groups: Record<NotificationType, Notification[]> = {
      success: [],
      warning: [],
      error: [],
      info: [],
      transaction: [],
      system: []
    }
    notifications.value.forEach(n => {
      groups[n.type].push(n)
    })
    return groups
  })

  // Load notifications from storage
  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        notifications.value = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
      }
    } catch (e) {
      console.warn('Failed to load notifications:', e)
    }
  }

  // Save notifications to storage
  const saveNotifications = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.value))
    } catch (e) {
      console.warn('Failed to save notifications:', e)
    }
  }

  // Add new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date(),
      read: false
    }
    notifications.value.unshift(newNotification)
    saveNotifications()
    return newNotification
  }

  // Quick notification helpers
  const notify = {
    success: (title: string, message: string, options?: Partial<Notification>) => 
      addNotification({ title, message, type: 'success', priority: 'normal', ...options }),
    
    warning: (title: string, message: string, options?: Partial<Notification>) => 
      addNotification({ title, message, type: 'warning', priority: 'high', ...options }),
    
    error: (title: string, message: string, options?: Partial<Notification>) => 
      addNotification({ title, message, type: 'error', priority: 'urgent', ...options }),
    
    info: (title: string, message: string, options?: Partial<Notification>) => 
      addNotification({ title, message, type: 'info', priority: 'normal', ...options }),
    
    transaction: (title: string, message: string, options?: Partial<Notification>) => 
      addNotification({ title, message, type: 'transaction', priority: 'high', ...options }),
    
    system: (title: string, message: string, options?: Partial<Notification>) => 
      addNotification({ title, message, type: 'system', priority: 'low', ...options }),
  }

  // Mark as read
  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification) {
      notification.read = true
      saveNotifications()
    }
  }

  // Mark all as read
  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
    saveNotifications()
  }

  // Remove notification
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      saveNotifications()
    }
  }

  // Clear all notifications
  const clearAll = () => {
    notifications.value = []
    saveNotifications()
  }

  // Clear read notifications
  const clearRead = () => {
    notifications.value = notifications.value.filter(n => !n.read)
    saveNotifications()
  }

  // Initialize with sample data if empty
  const initializeSampleData = () => {
    if (notifications.value.length === 0) {
      const sampleNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
        {
          title: 'قرعه‌کشی جدید',
          message: 'قرعه‌کشی هفتگی شماره ۱۲۵ ایجاد شد',
          type: 'success',
          priority: 'normal',
          actionUrl: '/lotteries/125',
          actionLabel: 'مشاهده'
        },
        {
          title: 'تراکنش مشکوک',
          message: 'تراکنش با مبلغ غیرعادی شناسایی شد',
          type: 'warning',
          priority: 'high',
          actionUrl: '/transactions?filter=suspicious',
          actionLabel: 'بررسی'
        },
        {
          title: 'پرداخت موفق',
          message: 'جایزه علی محمدی واریز شد - ۵,۰۰۰,۰۰۰ تومان',
          type: 'transaction',
          priority: 'normal'
        },
        {
          title: 'به‌روزرسانی سیستم',
          message: 'نسخه جدید سیستم در دسترس است',
          type: 'system',
          priority: 'low'
        },
        {
          title: 'خطای پردازش',
          message: 'خطا در پردازش گزارش ماهانه',
          type: 'error',
          priority: 'urgent',
          actionUrl: '/reports/errors',
          actionLabel: 'جزئیات'
        }
      ]
      
      sampleNotifications.forEach((n, i) => {
        setTimeout(() => addNotification(n), i * 100)
      })
    }
  }

  // Initialize
  const initialize = () => {
    if (isInitialized.value) return
    loadNotifications()
    initializeSampleData()
    isInitialized.value = true
  }

  // Format relative time (Persian)
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'همین الان'
    if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`
    if (diffHours < 24) return `${diffHours} ساعت پیش`
    if (diffDays < 7) return `${diffDays} روز پیش`
    return new Date(date).toLocaleDateString('fa-IR')
  }

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, string> = {
      success: 'mdi-check-circle',
      warning: 'mdi-alert',
      error: 'mdi-alert-circle',
      info: 'mdi-information',
      transaction: 'mdi-cash-multiple',
      system: 'mdi-cog'
    }
    return icons[type]
  }

  // Get notification color
  const getNotificationColor = (type: NotificationType) => {
    const colors: Record<NotificationType, string> = {
      success: 'success',
      warning: 'warning',
      error: 'error',
      info: 'info',
      transaction: 'primary',
      system: 'grey'
    }
    return colors[type]
  }

  // Watch for changes
  watch(notifications, saveNotifications, { deep: true })

  return {
    // State
    notifications,
    unreadCount,
    hasUnread,
    unreadNotifications,
    readNotifications,
    sortedNotifications,
    groupedByType,
    
    // Actions
    addNotification,
    notify,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    clearRead,
    initialize,
    
    // Helpers
    formatRelativeTime,
    getNotificationIcon,
    getNotificationColor,
  }
}
