import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { billSchema } from '@/lib/validations'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const bill = await prisma.bill.findUnique({
      where: { id: params.id }
    })

    if (!bill || bill.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = billSchema.partial().parse(body)

    const updateData: any = {
      ...validatedData,
    }

    if (validatedData.dueDate) {
      updateData.dueDate = new Date(validatedData.dueDate)
    }

    if (validatedData.status) {
      updateData.status = validatedData.status
    }

    if (validatedData.receiptUrl !== undefined) {
      updateData.receiptUrl = validatedData.receiptUrl || null
    }

    const updatedBill = await prisma.bill.update({
      where: { id: params.id },
      data: updateData
    })

    return NextResponse.json(updatedBill)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao atualizar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar conta' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const bill = await prisma.bill.findUnique({
      where: { id: params.id }
    })

    if (!bill || bill.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Conta não encontrada' },
        { status: 404 }
      )
    }

    await prisma.bill.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Conta deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar conta:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar conta' },
      { status: 500 }
    )
  }
}

