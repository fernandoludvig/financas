import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendBillNotification } from '@/lib/email/send'
import { addDays, startOfDay } from 'date-fns'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const today = startOfDay(new Date())
    
    const configs = await prisma.notificationConfig.findMany({
      where: { enabled: true },
      include: { user: true }
    })

    const results = []

    for (const config of configs) {
      const targetDate = addDays(today, config.daysBeforeDue)
      
      const bills = await prisma.bill.findMany({
        where: {
          userId: config.userId,
          status: 'PENDING',
          dueDate: {
            gte: today,
            lte: targetDate
          }
        }
      })

      if (bills.length > 0) {
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

        if (result.success) {
          await prisma.notificationConfig.update({
            where: { id: config.id },
            data: { lastNotification: new Date() }
          })
        }

        results.push({
          userId: config.userId,
          email,
          billsCount: bills.length,
          success: result.success
        })
      }
    }

    return NextResponse.json({
      success: true,
      processedUsers: results.length,
      results
    })
  } catch (error) {
    console.error('Erro no cron:', error)
    return NextResponse.json(
      { error: 'Erro ao processar notificações' },
      { status: 500 }
    )
  }
}

