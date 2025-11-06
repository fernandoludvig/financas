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
    const name = searchParams.get('name')

    if (name) {
      // Busca categoria específica
      const category = await prisma.category.findUnique({
        where: {
          userId_name: {
            userId: session.user.id,
            name: name.trim()
          }
        }
      })

      if (category) {
        return NextResponse.json(category)
      }

      return NextResponse.json(null)
    }

    // Lista todas as categorias do usuário
    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(categories)
  } catch (error: any) {
    console.error('Erro ao buscar categorias:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
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
    const { name, color } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }

    const categoryName = name.trim()
    const categoryColor = color || '#3b82f6'

    // Busca ou cria categoria
    const category = await prisma.category.upsert({
      where: {
        userId_name: {
          userId: session.user.id,
          name: categoryName
        }
      },
      update: {
        color: categoryColor
      },
      create: {
        name: categoryName,
        color: categoryColor,
        userId: session.user.id
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error: any) {
    console.error('Erro ao salvar categoria:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Categoria já existe' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erro ao salvar categoria' },
      { status: 500 }
    )
  }
}

