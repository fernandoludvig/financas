'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
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

  const data = days.map(day => {
    const dayBills = bills.filter(bill => {
      const billDate = new Date(bill.dueDate)
      return billDate.toDateString() === day.toDateString()
    })

    const income = dayBills
      .filter(b => b.type === 'INCOME' && b.status === 'PAID')
      .reduce((sum, b) => sum + Number(b.amount), 0)

    const expenses = dayBills
      .filter(b => b.type === 'EXPENSE' && b.status === 'PAID')
      .reduce((sum, b) => sum + Number(b.amount), 0)

    return {
      date: format(day, 'dd/MM', { locale: ptBR }),
      Receitas: income,
      Despesas: expenses,
      Saldo: income - expenses
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
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="Receitas" stroke="#22c55e" strokeWidth={2} />
            <Line type="monotone" dataKey="Despesas" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

