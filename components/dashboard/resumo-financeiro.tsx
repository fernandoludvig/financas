import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface ResumoFinanceiroProps {
  stats: {
    type: string
    status: string
    _sum: { amount: number | null }
    _count: number
  }[]
}

export default function ResumoFinanceiro({ stats }: ResumoFinanceiroProps) {
  const income = stats
    .filter(s => s.type === 'INCOME' && s.status === 'PAID')
    .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0)

  const expenses = stats
    .filter(s => s.type === 'EXPENSE' && s.status === 'PAID')
    .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0)

  const pendingIncome = stats
    .filter(s => s.type === 'INCOME' && s.status === 'PENDING')
    .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0)

  const pendingExpenses = stats
    .filter(s => s.type === 'EXPENSE' && s.status === 'PENDING')
    .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0)

  const balance = income - expenses
  const projectedBalance = (income + pendingIncome) - (expenses + pendingExpenses)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(income)}
          </div>
          {pendingIncome > 0 && (
            <p className="text-xs text-muted-foreground">
              Pendente: {formatCurrency(pendingIncome)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(expenses)}
          </div>
          {pendingExpenses > 0 && (
            <p className="text-xs text-muted-foreground">
              Pendente: {formatCurrency(pendingExpenses)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balance)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(projectedBalance)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

