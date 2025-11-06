'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ExtratoItem {
  id: string
  vencimento: string
  dataPagamento: string | null
  valor: number
  descricao: string
  comprovante: string | null
  tipo: 'INCOME' | 'EXPENSE'
  status: string
}

export default function RelatoriosPage() {
  const { toast } = useToast()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [extrato, setExtrato] = useState<ExtratoItem[]>([])
  const [loadingExtrato, setLoadingExtrato] = useState(false)
  const [loadingPDF, setLoadingPDF] = useState(false)

  useEffect(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const handleGenerateReport = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/relatorios/${year}/${month}`)

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${month}-${year}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Sucesso!',
        description: 'Relatório gerado com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o relatório',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBuscarExtrato = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Erro',
        description: 'Selecione o período',
        variant: 'destructive',
      })
      return
    }

    setLoadingExtrato(true)

    try {
      const response = await fetch(
        `/api/relatorios/extrato-contabilidade?startDate=${startDate}&endDate=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Erro ao buscar extrato')
      }

      const data = await response.json()
      setExtrato(data)

      toast({
        title: 'Sucesso!',
        description: 'Extrato carregado com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar o extrato',
        variant: 'destructive',
      })
    } finally {
      setLoadingExtrato(false)
    }
  }

  const handleGenerateExtratoPDF = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Erro',
        description: 'Selecione o período',
        variant: 'destructive',
      })
      return
    }

    setLoadingPDF(true)

    try {
      const response = await fetch(
        `/api/relatorios/extrato-contabilidade/pdf?startDate=${startDate}&endDate=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Erro ao gerar PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `extrato-contabilidade-${startDate}-${endDate}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Sucesso!',
        description: 'PDF do extrato gerado com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar o PDF',
        variant: 'destructive',
      })
    } finally {
      setLoadingPDF(false)
    }
  }

  const handleDownloadComprovante = async (receiptUrl: string, description: string) => {
    try {
      const response = await fetch(receiptUrl)
      
      if (!response.ok) {
        throw new Error('Erro ao baixar comprovante')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const urlParts = receiptUrl.split('/')
      const fileName = urlParts[urlParts.length - 1] || `comprovante-${description.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
      a.download = fileName
      
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Sucesso!',
        description: 'Comprovante baixado com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar o comprovante',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      
      <Tabs defaultValue="mensal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mensal">Relatório Mensal</TabsTrigger>
          <TabsTrigger value="extrato">Extrato Contabilidade</TabsTrigger>
        </TabsList>

        <TabsContent value="mensal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Gerar Relatório Mensal
              </CardTitle>
              <CardDescription>
                Selecione o mês e ano para gerar um relatório em PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Mês</Label>
                  <Input
                    id="month"
                    type="number"
                    min="1"
                    max="12"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    min="2020"
                    max="2100"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                  />
                </div>
              </div>
              <Button onClick={handleGenerateReport} disabled={loading} className="w-full">
                {loading ? (
                  'Gerando...'
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Gerar Relatório PDF
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extrato" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Extrato Contabilidade
              </CardTitle>
              <CardDescription>
                Visualize o extrato contábil por período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Relatório</Label>
                <Input value="Extrato Contabilidade" disabled className="bg-muted" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data Inicial</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data Final</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleBuscarExtrato} disabled={loadingExtrato} className="w-full">
                  {loadingExtrato ? 'Buscando...' : 'Buscar Extrato'}
                </Button>
                <Button 
                  onClick={handleGenerateExtratoPDF} 
                  disabled={loadingPDF || !startDate || !endDate} 
                  variant="outline"
                  className="w-full"
                >
                  {loadingPDF ? (
                    'Gerando PDF...'
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Gerar PDF
                    </>
                  )}
                </Button>
              </div>

              {extrato.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vencimento</TableHead>
                          <TableHead>Data do Pagamento</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Comprovante</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {extrato.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{formatDate(item.vencimento)}</TableCell>
                            <TableCell>
                              {item.dataPagamento ? formatDate(item.dataPagamento) : '-'}
                            </TableCell>
                            <TableCell>
                              <span className={item.tipo === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                                {item.tipo === 'INCOME' ? '+' : '-'}{formatCurrency(item.valor)}
                              </span>
                            </TableCell>
                            <TableCell>{item.descricao}</TableCell>
                            <TableCell>
                              {item.comprovante ? (
                                <button
                                  onClick={() => handleDownloadComprovante(item.comprovante!, item.descricao)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium"
                                >
                                  Sim
                                </button>
                              ) : (
                                <span className="text-sm text-muted-foreground">Não</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

