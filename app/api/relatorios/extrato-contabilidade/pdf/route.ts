import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateExtratoContabilidade } from '@/lib/pdf/generator'

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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    const extratoItems = bills.map(bill => ({
      vencimento: bill.dueDate,
      dataPagamento: bill.paidDate,
      valor: Number(bill.amount),
      descricao: bill.description,
      comprovante: bill.receiptUrl,
      tipo: bill.type
    }))

    const pdfBuffer = await generateExtratoContabilidade(
      start,
      end,
      extratoItems,
      user.name
    )

    const startFormatted = start.toISOString().split('T')[0]
    const endFormatted = end.toISOString().split('T')[0]

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="extrato-contabilidade-${startFormatted}-${endFormatted}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar PDF do extrato contabilidade:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar PDF do extrato contabilidade' },
      { status: 500 }
    )
  }
}

