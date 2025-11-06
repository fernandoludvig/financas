import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { billSchema } from '@/lib/validations'

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
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {
      userId: session.user.id
    }

    if (type) {
      where.type = type
    }

    if (status) {
      where.status = status
    }

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      where.dueDate = {
        gte: startDate,
        lte: endDate
      }
    }

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(bills)
  } catch (error) {
    console.error('Erro ao buscar contas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar contas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = billSchema.parse(body)

    const bill = await prisma.bill.create({
      data: {
        ...validatedData,
        dueDate: new Date(validatedData.dueDate),
        paidDate: validatedData.paidDate ? new Date(validatedData.paidDate) : null,
        categoryColor: validatedData.categoryColor || '#3b82f6',
        userId: session.user.id
      }
    })

    return NextResponse.json(bill, { status: 201 })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao criar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    )
  }
}

