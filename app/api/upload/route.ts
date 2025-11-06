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

    // Verifica se está em produção (Vercel)
    const isVercel = process.env.VERCEL === '1'
    const isProduction = isVercel || process.env.NODE_ENV === 'production'
    const isDevelopment = !isVercel && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV)
    
    // Tenta usar Vercel Blob primeiro se o token estiver configurado
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN
    if (blobToken && blobToken !== '' && blobToken !== 're_placeholder') {
      try {
        const blob = await put(`receipts/${filename}`, file, {
          access: 'public',
          contentType: file.type || 'application/pdf',
        })
        return NextResponse.json({ url: blob.url })
      } catch (blobError: any) {
        console.error('Erro ao usar Vercel Blob:', blobError)
        // Se estiver em produção (Vercel) e o Blob falhar, retorna erro
        if (isProduction && isVercel) {
          return NextResponse.json(
            { 
              error: 'Erro ao fazer upload no Vercel Blob',
              message: blobError.message || 'Não foi possível fazer upload. Verifique a configuração do BLOB_READ_WRITE_TOKEN.',
              details: process.env.NODE_ENV === 'development' ? blobError.stack : undefined
            },
            { status: 500 }
          )
        }
        // Em desenvolvimento ou se não estiver no Vercel, tenta sistema de arquivos local
        console.log('Tentando sistema de arquivos local como fallback...')
      }
    }

    // Se estiver no Vercel (produção) sem Blob configurado, retorna erro
    if (isVercel && (!blobToken || blobToken === '' || blobToken === 're_placeholder')) {
      return NextResponse.json(
        { 
          error: 'Upload não configurado',
          message: 'Configure BLOB_READ_WRITE_TOKEN no Vercel para fazer upload de arquivos em produção.'
        },
        { status: 500 }
      )
    }

    // Fallback para sistema de arquivos local (desenvolvimento ou quando Blob não está disponível)
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
      
      // Se estiver no Vercel e o sistema de arquivos falhar, retorna erro específico
      if (isVercel) {
        return NextResponse.json(
          { 
            error: 'Upload não configurado',
            message: 'Configure BLOB_READ_WRITE_TOKEN no Vercel. O sistema de arquivos não está disponível em produção.'
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao fazer upload do arquivo',
          message: fsError.message || 'Erro desconhecido',
          details: isDevelopment ? fsError.stack : undefined
        },
        { status: 500 }
      )
    }
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

