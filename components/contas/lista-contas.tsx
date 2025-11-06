'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Edit, Trash2, Plus, FileText, ExternalLink } from 'lucide-react'
import FormConta from './form-conta'
import StatusBadge from './status-badge'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

interface Bill {
  id: string
  description: string
  amount: number
  dueDate: Date
  type: 'INCOME' | 'EXPENSE'
  status: string
  category?: string | null
  categoryColor?: string | null
  receiptUrl?: string | null
}

interface ListaContasProps {
  bills: Bill[]
}

export default function ListaContas({ bills }: ListaContasProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) {
      return
    }

    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erro ao deletar')

      toast({
        title: 'Sucesso!',
        description: 'Conta deletada com sucesso',
      })

      router.refresh()
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível deletar a conta',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/contas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar status')
      }

      toast({
        title: 'Sucesso!',
        description: 'Status atualizado com sucesso',
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contas</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Nova Conta</DialogTitle>
              <DialogDescription>
                Preencha os dados da conta a pagar ou receber
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <FormConta
                onSuccess={() => {
                  setIsDialogOpen(false)
                  router.refresh()
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Cor da Categoria</TableHead>
              <TableHead>Comprovante</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  Nenhuma conta encontrada
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell className="font-medium">{bill.description}</TableCell>
                  <TableCell>
                    <span className={bill.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                      {bill.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(bill.amount))}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(bill.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={bill.type === 'INCOME' ? 'default' : 'secondary'}>
                      {bill.type === 'INCOME' ? 'Receita' : 'Despesa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={bill.status || 'PENDING'}
                      onValueChange={(value) => handleStatusChange(bill.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PAID">Pago</SelectItem>
                        <SelectItem value="OVERDUE">Vencido</SelectItem>
                        <SelectItem value="CANCELLED">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{bill.category || '-'}</TableCell>
                  <TableCell>
                    {bill.categoryColor ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: bill.categoryColor }}
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          {bill.categoryColor}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {bill.receiptUrl ? (
                      <a
                        href={bill.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="text-sm">Ver</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingBill(bill)
                          setIsDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(bill.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingBill && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Editar Conta</DialogTitle>
              <DialogDescription>
                Atualize os dados da conta
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              <FormConta
                initialData={editingBill}
                onSuccess={() => {
                  setEditingBill(null)
                  setIsDialogOpen(false)
                  router.refresh()
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

