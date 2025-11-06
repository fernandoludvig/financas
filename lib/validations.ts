import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const billSchema = z.object({
  description: z.string().min(3, 'Descrição muito curta'),
  amount: z.number().positive('Valor deve ser positivo'),
  dueDate: z.string(),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().optional(),
  notes: z.string().optional(),
})

export const notificationConfigSchema = z.object({
  daysBeforeDue: z.number().int().min(1).max(30),
  notificationEmail: z.string().email().optional().or(z.literal('')),
  enabled: z.boolean(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type BillInput = z.infer<typeof billSchema>
export type NotificationConfigInput = z.infer<typeof notificationConfigSchema>

