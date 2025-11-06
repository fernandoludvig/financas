'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { billSchema, type BillInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { Upload, X } from 'lucide-react'

interface FormContaProps {
  initialData?: any
  onSuccess?: () => void
}

export default function FormConta({ initialData, onSuccess }: FormContaProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(initialData?.receiptUrl || null)

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BillInput>({
    resolver: zodResolver(billSchema),
    defaultValues: initialData ? {
      ...initialData,
      dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
      amount: Number(initialData.amount),
      receiptUrl: initialData.receiptUrl || undefined
    } : undefined
  })

  useEffect(() => {
    if (initialData?.receiptUrl) {
      setReceiptUrl(initialData.receiptUrl)
    }
  }, [initialData])

  const type = watch('type')

  const handleFileUpload = async (file: File) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo')
      }

      const result = await response.json()
      setReceiptUrl(result.url)
      toast({
        title: 'Sucesso!',
        description: 'Comprovante enviado com sucesso',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível fazer upload do comprovante',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveReceipt = () => {
    setReceiptUrl(null)
  }

  const onSubmit = async (data: BillInput) => {
    setLoading(true)
    
    try {
      const method = initialData ? 'PATCH' : 'POST'
      const url = initialData 
        ? `/api/contas/${initialData.id}` 
        : '/api/contas'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          receiptUrl: receiptUrl || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao salvar conta')
      }

      toast({
        title: 'Sucesso!',
        description: 'Conta salva com sucesso',
      })
      
      if (onSuccess) {
        onSuccess()
      } else {
        router.push('/contas')
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a conta',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          {...register('description')}
          placeholder="Ex: Conta de luz"
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Valor</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="text-sm text-red-500 mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="dueDate">Vencimento</Label>
        <Input
          id="dueDate"
          type="date"
          {...register('dueDate')}
        />
        {errors.dueDate && (
          <p className="text-sm text-red-500 mt-1">{errors.dueDate.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="type">Tipo</Label>
        <Select
          value={type}
          onValueChange={(value) => setValue('type', value as 'INCOME' | 'EXPENSE')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EXPENSE">Despesa</SelectItem>
            <SelectItem value="INCOME">Receita</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="category">Categoria (opcional)</Label>
        <Input
          id="category"
          {...register('category')}
          placeholder="Ex: Alimentação"
        />
      </div>

      <div>
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Input
          id="notes"
          {...register('notes')}
          placeholder="Observações adicionais"
        />
      </div>

      <div>
        <Label htmlFor="receipt">Comprovante (opcional)</Label>
        {receiptUrl ? (
          <div className="flex items-center gap-2 p-3 border rounded-md">
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-sm text-blue-600 hover:underline"
            >
              Ver comprovante
            </a>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveReceipt}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileUpload(file)
                }
              }}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && (
              <p className="text-sm text-muted-foreground">Enviando comprovante...</p>
            )}
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading || uploading} className="w-full">
        {loading ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}

