import { Badge } from '@/components/ui/badge'
import { BillStatus } from '@prisma/client'

interface StatusBadgeProps {
  status: BillStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<BillStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    PENDING: 'secondary',
    PAID: 'default',
    OVERDUE: 'destructive',
    CANCELLED: 'outline'
  }

  const labels: Record<BillStatus, string> = {
    PENDING: 'Pendente',
    PAID: 'Pago',
    OVERDUE: 'Vencido',
    CANCELLED: 'Cancelado'
  }

  return (
    <Badge variant={variants[status]}>
      {labels[status]}
    </Badge>
  )
}

