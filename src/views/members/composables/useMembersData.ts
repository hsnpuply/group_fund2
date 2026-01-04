import { ref } from 'vue'

export interface Member {
  id: number
  avatar: string
  fullName: string
  status: 'active' | 'suspended-temp' | 'suspended-permanent'
  suspensionDuration?: {
    value: number
    unit: 'months' | 'years'
  }
  totalLotteriesJoined: number
  activeLotteriesCount: number
  totalTicketsOwned: number
  penaltyStatus: 'none' | 'temporary' | 'permanent'
  registrationDate: string
  nationalId: string
  phone: string
  email: string
  address?: string
  totalContributions: number
  lastActivity: string
}

export const useMembersData = () => {
  // Mock data for members
  const members = ref<Member[]>([
    {
      id: 1001,
      avatar: 'https://i.pravatar.cc/150?img=1',
      fullName: 'علی احمدی',
      status: 'active',
      totalLotteriesJoined: 8,
      activeLotteriesCount: 3,
      totalTicketsOwned: 24,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۳/۰۳/۱۵',
      nationalId: '0012345678',
      phone: '09121234567',
      email: 'ali.ahmadi@example.com',
      address: 'تهران، خیابان آزادی',
      totalContributions: 45000000,
      lastActivity: '۱۴۰۴/۱۰/۱۵'
    },
    {
      id: 1002,
      avatar: 'https://i.pravatar.cc/150?img=5',
      fullName: 'سارا محمدی',
      status: 'active',
      totalLotteriesJoined: 12,
      activeLotteriesCount: 5,
      totalTicketsOwned: 35,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۲/۱۲/۲۰',
      nationalId: '0012345679',
      phone: '09121234568',
      email: 'sara.mohammadi@example.com',
      address: 'مشهد، خیابان امام رضا',
      totalContributions: 72000000,
      lastActivity: '۱۴۰۴/۱۰/۱۴'
    },
    {
      id: 1003,
      avatar: 'https://i.pravatar.cc/150?img=8',
      fullName: 'رضا کریمی',
      status: 'suspended-temp',
      suspensionDuration: {
        value: 6,
        unit: 'months'
      },
      totalLotteriesJoined: 5,
      activeLotteriesCount: 0,
      totalTicketsOwned: 15,
      penaltyStatus: 'temporary',
      registrationDate: '۱۴۰۳/۰۵/۱۰',
      nationalId: '0012345680',
      phone: '09121234569',
      email: 'reza.karimi@example.com',
      address: 'اصفهان، خیابان چهارباغ',
      totalContributions: 28000000,
      lastActivity: '۱۴۰۴/۰۸/۲۵'
    },
    {
      id: 1004,
      avatar: 'https://i.pravatar.cc/150?img=9',
      fullName: 'فاطمه نوری',
      status: 'active',
      totalLotteriesJoined: 15,
      activeLotteriesCount: 7,
      totalTicketsOwned: 48,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۲/۰۸/۰۵',
      nationalId: '0012345681',
      phone: '09121234570',
      email: 'fatemeh.noori@example.com',
      address: 'شیراز، خیابان ولیعصر',
      totalContributions: 95000000,
      lastActivity: '۱۴۰۴/۱۰/۱۶'
    },
    {
      id: 1005,
      avatar: 'https://i.pravatar.cc/150?img=12',
      fullName: 'محمد رضایی',
      status: 'suspended-permanent',
      totalLotteriesJoined: 3,
      activeLotteriesCount: 0,
      totalTicketsOwned: 8,
      penaltyStatus: 'permanent',
      registrationDate: '۱۴۰۳/۰۱/۱۲',
      nationalId: '0012345682',
      phone: '09121234571',
      email: 'mohammad.rezaei@example.com',
      address: 'تبریز، خیابان امام خمینی',
      totalContributions: 12000000,
      lastActivity: '۱۴۰۴/۰۷/۰۱'
    },
    {
      id: 1006,
      avatar: 'https://i.pravatar.cc/150?img=20',
      fullName: 'زهرا حسینی',
      status: 'active',
      totalLotteriesJoined: 10,
      activeLotteriesCount: 4,
      totalTicketsOwned: 30,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۲/۱۱/۲۸',
      nationalId: '0012345683',
      phone: '09121234572',
      email: 'zahra.hosseini@example.com',
      address: 'کرج، خیابان شهید بهشتی',
      totalContributions: 58000000,
      lastActivity: '۱۴۰۴/۱۰/۱۶'
    },
    {
      id: 1007,
      avatar: 'https://i.pravatar.cc/150?img=33',
      fullName: 'حسن علیزاده',
      status: 'active',
      totalLotteriesJoined: 6,
      activeLotteriesCount: 2,
      totalTicketsOwned: 18,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۳/۰۴/۲۰',
      nationalId: '0012345684',
      phone: '09121234573',
      email: 'hasan.alizadeh@example.com',
      address: 'اهواز، خیابان کیانپارس',
      totalContributions: 36000000,
      lastActivity: '۱۴۰۴/۱۰/۱۵'
    },
    {
      id: 1008,
      avatar: 'https://i.pravatar.cc/150?img=25',
      fullName: 'مریم صادقی',
      status: 'suspended-temp',
      suspensionDuration: {
        value: 1,
        unit: 'years'
      },
      totalLotteriesJoined: 4,
      activeLotteriesCount: 0,
      totalTicketsOwned: 12,
      penaltyStatus: 'temporary',
      registrationDate: '۱۴۰۳/۰۲/۱۸',
      nationalId: '0012345685',
      phone: '09121234574',
      email: 'maryam.sadeghi@example.com',
      address: 'قم، خیابان امین',
      totalContributions: 24000000,
      lastActivity: '۱۴۰۴/۰۶/۱۰'
    },
    {
      id: 1009,
      avatar: 'https://i.pravatar.cc/150?img=36',
      fullName: 'امیر حسن‌پور',
      status: 'active',
      totalLotteriesJoined: 20,
      activeLotteriesCount: 9,
      totalTicketsOwned: 60,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۲/۰۶/۰۸',
      nationalId: '0012345686',
      phone: '09121234575',
      email: 'amir.hasanpour@example.com',
      address: 'کرمان، خیابان جمهوری',
      totalContributions: 125000000,
      lastActivity: '۱۴۰۴/۱۰/۱۶'
    },
    {
      id: 1010,
      avatar: 'https://i.pravatar.cc/150?img=47',
      fullName: 'نسرین مرادی',
      status: 'active',
      totalLotteriesJoined: 7,
      activeLotteriesCount: 3,
      totalTicketsOwned: 21,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۳/۰۷/۱۲',
      nationalId: '0012345687',
      phone: '09121234576',
      email: 'nasrin.moradi@example.com',
      address: 'رشت، خیابان معلم',
      totalContributions: 42000000,
      lastActivity: '۱۴۰۴/۱۰/۱۴'
    },
    {
      id: 1011,
      avatar: 'https://i.pravatar.cc/150?img=52',
      fullName: 'علیرضا جعفری',
      status: 'active',
      totalLotteriesJoined: 9,
      activeLotteriesCount: 4,
      totalTicketsOwned: 27,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۳/۰۶/۲۵',
      nationalId: '0012345688',
      phone: '09121234577',
      email: 'alireza.jafari@example.com',
      address: 'یزد، خیابان دهم فروردین',
      totalContributions: 52000000,
      lastActivity: '۱۴۰۴/۱۰/۱۵'
    },
    {
      id: 1012,
      avatar: 'https://i.pravatar.cc/150?img=16',
      fullName: 'شیوا رحمانی',
      status: 'active',
      totalLotteriesJoined: 11,
      activeLotteriesCount: 5,
      totalTicketsOwned: 33,
      penaltyStatus: 'none',
      registrationDate: '۱۴۰۲/۱۰/۱۵',
      nationalId: '0012345689',
      phone: '09121234578',
      email: 'shiva.rahmani@example.com',
      address: 'زنجان، خیابان سعدی',
      totalContributions: 68000000,
      lastActivity: '۱۴۰۴/۱۰/۱۶'
    }
  ])

  return {
    members
  }
}
