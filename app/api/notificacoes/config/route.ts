import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notificationConfigSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    let config = await prisma.notificationConfig.findUnique({
      where: { userId: session.user.id }
    })

    if (!config) {
      config = await prisma.notificationConfig.create({
        data: {
          userId: session.user.id,
          daysBeforeDue: 3,
          enabled: true,
        }
      })
    }

    return NextResponse.json(config)
  } catch (error) {
    console.error('Erro ao buscar configuração:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar configuração' },
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
    const validatedData = notificationConfigSchema.parse(body)

    let config = await prisma.notificationConfig.findUnique({
      where: { userId: session.user.id }
    })

    if (config) {
      config = await prisma.notificationConfig.update({
        where: { id: config.id },
        data: validatedData
      })
    } else {
      config = await prisma.notificationConfig.create({
        data: {
          ...validatedData,
          userId: session.user.id
        }
      })
    }

    return NextResponse.json(config)
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao salvar configuração:', error)
    return NextResponse.json(
      { error: 'Erro ao salvar configuração' },
      { status: 500 }
    )
  }
}

