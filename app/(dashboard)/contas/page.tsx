import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ListaContas from '@/components/contas/lista-contas'

export default async function ContasPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/login')
  }

  const bills = await prisma.bill.findMany({
    where: { userId: session.user.id },
    orderBy: { dueDate: 'desc' }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Contas</h1>
      <ListaContas bills={bills} />
    </div>
  )
}

