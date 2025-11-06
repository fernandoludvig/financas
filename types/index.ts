import { BillType, BillStatus } from '@prisma/client'

export interface Bill {
  id: string
  description: string
  amount: number
  dueDate: Date
  type: BillType
  status: BillStatus
  category?: string | null
  notes?: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface NotificationConfig {
  id: string
  daysBeforeDue: number
  notificationEmail?: string | null
  enabled: boolean
  lastNotification?: Date | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
    }
  }
}

