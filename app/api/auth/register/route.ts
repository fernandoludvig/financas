import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
      }
    })

    await prisma.notificationConfig.create({
      data: {
        userId: user.id,
        daysBeforeDue: 3,
        enabled: true,
      }
    })

    try {
      await sendWelcomeEmail(user.email, user.name)
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError)
    }

    return NextResponse.json(
      { message: 'Usuário criado com sucesso', userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 400 }
      )
    }

    console.error('Erro ao registrar usuário:', error)
    
    let errorMessage = 'Erro ao criar usuário'
    if (error.message?.includes('Can\'t reach database server') || 
        error.message?.includes('P1001') ||
        error.code === 'P1001') {
      errorMessage = 'Erro de conexão com o banco de dados. Verifique se o PostgreSQL está configurado corretamente.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

