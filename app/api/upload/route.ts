import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Tamanho máximo: 10MB' },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileExtension = sanitizedFileName.split('.').pop() || 'pdf'
    const filename = `${session.user.id}_${timestamp}.${fileExtension}`

    if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== '') {
      try {
        const blob = await put(`receipts/${filename}`, file, {
          access: 'public',
          contentType: file.type || 'application/pdf',
        })
        return NextResponse.json({ url: blob.url })
      } catch (blobError: any) {
        console.error('Erro ao usar Vercel Blob:', blobError)
        return NextResponse.json(
          { 
            error: 'Erro ao fazer upload no Vercel Blob',
            message: blobError.message || 'Erro desconhecido',
            details: process.env.NODE_ENV === 'development' ? blobError.stack : undefined
          },
          { status: 500 }
        )
      }
    }

    if (process.env.NODE_ENV === 'development') {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'receipts')
        
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        const filepath = join(uploadsDir, filename)
        await writeFile(filepath, buffer)

        const url = `/uploads/receipts/${filename}`
        return NextResponse.json({ url })
      } catch (fsError: any) {
        console.error('Erro ao usar sistema de arquivos:', fsError)
        return NextResponse.json(
          { 
            error: 'Erro ao fazer upload do arquivo',
            message: fsError.message || 'Erro desconhecido',
            details: process.env.NODE_ENV === 'development' ? fsError.stack : undefined
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { 
        error: 'Upload não configurado',
        message: 'Configure BLOB_READ_WRITE_TOKEN para fazer upload de arquivos no Vercel'
      },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error)
    return NextResponse.json(
      { 
        error: 'Erro ao fazer upload do arquivo',
        message: error.message || 'Erro desconhecido',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

