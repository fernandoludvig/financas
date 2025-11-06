import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface Bill {
  id: string
  description: string
  amount: number
  dueDate: Date
  type: 'INCOME' | 'EXPENSE'
  status: string
}

interface ProximosVencimentosProps {
  bills: Bill[]
}

export default function ProximosVencimentos({ bills }: ProximosVencimentosProps) {
  const now = new Date()
  const upcomingBills = bills
    .filter(bill => {
      const daysUntilDue = differenceInDays(new Date(bill.dueDate), now)
      return bill.status === 'PENDING' && daysUntilDue >= 0 && daysUntilDue <= 7
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Vencimentos (7 dias)</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingBills.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma conta próxima do vencimento
          </p>
        ) : (
          <div className="space-y-4">
            {upcomingBills.map(bill => {
              const daysUntilDue = differenceInDays(new Date(bill.dueDate), now)
              return (
                <div key={bill.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <p className="font-medium">{bill.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(bill.dueDate)}
                      </span>
                      <Badge variant={daysUntilDue <= 2 ? 'destructive' : 'secondary'}>
                        {daysUntilDue === 0 ? 'Hoje' : `${daysUntilDue} dias`}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${bill.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {bill.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(bill.amount))}
                    </p>
                  </div>
                </div>
              )
            })}
            <Link href="/contas">
              <Button variant="outline" className="w-full">
                Ver todas as contas
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

