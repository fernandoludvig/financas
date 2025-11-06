import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ResumoFinanceiro from '@/components/dashboard/resumo-financeiro'
import GraficoMensal from '@/components/dashboard/grafico-mensal'
import ProximosVencimentos from '@/components/dashboard/proximos-vencimentos'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  const [bills, stats] = await Promise.all([
    prisma.bill.findMany({
      where: { userId: session.user.id },
      orderBy: { dueDate: 'asc' },
      take: 10
    }),
    prisma.bill.groupBy({
      by: ['type', 'status'],
      where: { userId: session.user.id },
      _sum: { amount: true },
      _count: true
    })
  ])

  const billsFormatted = bills.map(bill => ({
    ...bill,
    amount: Number(bill.amount)
  }))

  const statsFormatted = stats.map(stat => ({
    ...stat,
    _sum: {
      ...stat._sum,
      amount: stat._sum.amount ? Number(stat._sum.amount) : null
    }
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <ResumoFinanceiro stats={statsFormatted} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoMensal bills={billsFormatted} />
        <ProximosVencimentos bills={billsFormatted} />
      </div>
    </div>
  )
}

