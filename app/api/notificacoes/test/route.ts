import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendBillNotification } from '@/lib/email/send'
import { addDays, startOfDay } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const config = await prisma.notificationConfig.findUnique({
      where: { userId: session.user.id },
      include: { user: true }
    })

    if (!config || !config.enabled) {
      return NextResponse.json(
        { error: 'Notificações não configuradas ou desativadas' },
        { status: 400 }
      )
    }

    const today = startOfDay(new Date())
    const targetDate = addDays(today, config.daysBeforeDue)

    const bills = await prisma.bill.findMany({
      where: {
        userId: session.user.id,
        status: 'PENDING',
        dueDate: {
          gte: today,
          lte: targetDate
        }
      },
      take: 5
    })

    if (bills.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma conta próxima do vencimento para testar'
      })
    }

    const email = config.notificationEmail || config.user.email

    const result = await sendBillNotification(
      email,
      config.user.name,
      bills.map(bill => ({
        description: bill.description,
        amount: Number(bill.amount),
        dueDate: bill.dueDate,
        daysUntilDue: Math.ceil(
          (bill.dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )
      }))
    )

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'Erro ao enviar email de teste',
          message: 'Erro ao enviar email de teste'
        },
        { status: 500 }
      )
    }

    await prisma.notificationConfig.update({
      where: { id: config.id },
      data: { lastNotification: new Date() }
    })

    return NextResponse.json({
      success: true,
      message: 'Email de teste enviado com sucesso'
    })
  } catch (error) {
    console.error('Erro ao testar notificação:', error)
    return NextResponse.json(
      { error: 'Erro ao testar notificação' },
      { status: 500 }
    )
  }
}

