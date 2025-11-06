import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateMonthlyReport } from '@/lib/pdf/generator'

export async function GET(
  request: NextRequest,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const year = parseInt(params.year)
    const month = parseInt(params.month)

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Data inválida' },
        { status: 400 }
      )
    }

    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const bills = await prisma.bill.findMany({
      where: {
        userId: session.user.id,
        dueDate: {
          gte: startDate,
          lte: endDate
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

    const pdfBuffer = await generateMonthlyReport(
      year,
      month,
      bills.map(bill => ({
        description: bill.description,
        amount: Number(bill.amount),
        dueDate: bill.dueDate,
        paidDate: bill.paidDate,
        type: bill.type,
        status: bill.status,
        category: bill.category,
        categoryColor: bill.categoryColor || '#3b82f6'
      })),
      user.name
    )

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio-${month}-${year}.pdf"`
      }
    })
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar relatório' },
      { status: 500 }
    )
  }
}

