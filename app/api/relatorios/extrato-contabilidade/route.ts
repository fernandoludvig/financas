import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Data inicial e final são obrigatórias' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)

    const bills = await prisma.bill.findMany({
      where: {
        userId: session.user.id,
        dueDate: {
          gte: start,
          lte: end
        }
      },
      orderBy: { dueDate: 'asc' }
    })

    const extrato = bills.map(bill => ({
      id: bill.id,
      vencimento: bill.dueDate.toISOString(),
      dataPagamento: bill.paidDate ? bill.paidDate.toISOString() : null,
      valor: Number(bill.amount),
      descricao: bill.description,
      comprovante: bill.receiptUrl,
      tipo: bill.type,
      status: bill.status
    }))

    return NextResponse.json(extrato)
  } catch (error) {
    console.error('Erro ao buscar extrato contábil:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar extrato contábil' },
      { status: 500 }
    )
  }
}

