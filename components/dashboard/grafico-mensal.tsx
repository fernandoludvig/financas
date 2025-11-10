'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Bill {
  amount: number
  dueDate: Date
  type: 'INCOME' | 'EXPENSE'
  status: string
}

interface GraficoMensalProps {
  bills: Bill[]
}

export default function GraficoMensal({ bills }: GraficoMensalProps) {
  const now = new Date()
  const start = startOfMonth(now)
  const end = endOfMonth(now)
  const days = eachDayOfInterval({ start, end })
  const normalizedBills = bills
    .filter((bill) => bill.status === 'PAID')
    .map((bill) => ({
      ...bill,
      dueDate: startOfDay(new Date(bill.dueDate))
    }))

  let cumulativeIncome = 0
  let cumulativeExpenses = 0

  const data = days.map(day => {
    const dailyIncome = normalizedBills
      .filter(b => b.type === 'INCOME' && b.dueDate.getTime() === startOfDay(day).getTime())
      .reduce((sum, b) => sum + Number(b.amount), 0)

    const dailyExpenses = normalizedBills
      .filter(b => b.type === 'EXPENSE' && b.dueDate.getTime() === startOfDay(day).getTime())
      .reduce((sum, b) => sum + Number(b.amount), 0)

    cumulativeIncome += dailyIncome
    cumulativeExpenses += dailyExpenses

    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      Receitas: cumulativeIncome,
      Despesas: cumulativeExpenses,
      Saldo: cumulativeIncome - cumulativeExpenses
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickMargin={12} />
            <YAxis tickFormatter={(value) => formatCurrency(value)} width={120} />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Dia ${label}`}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#e5e7eb" />
            <Line type="monotone" dataKey="Receitas" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

