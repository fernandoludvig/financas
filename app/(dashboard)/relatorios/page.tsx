'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Download, FileText } from 'lucide-react'

export default function RelatoriosPage() {
  const { toast } = useToast()
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Relatórios</h1>
      
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
    </div>
  )
}

