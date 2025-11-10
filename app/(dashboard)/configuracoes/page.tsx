'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Bell, Mail, Save } from 'lucide-react'

type NotificationConfigState = {
  daysBeforeDue: string
  notificationEmail: string
  enabled: boolean
}

export default function ConfiguracoesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [config, setConfig] = useState<NotificationConfigState>({
    daysBeforeDue: '3',
    notificationEmail: '',
    enabled: true,
  })

  useEffect(() => {
    fetch('/api/notificacoes/config')
      .then(res => res.json())
      .then(data => {
        if (typeof data.daysBeforeDue === 'number') {
          setConfig({
            daysBeforeDue: String(data.daysBeforeDue),
            notificationEmail: data.notificationEmail || '',
            enabled: data.enabled,
          })
        }
      })
      .catch(console.error)
  }, [])

  const handleSave = async () => {
    setLoading(true)

    try {
      const daysValue = parseInt(config.daysBeforeDue, 10)
      const payload = {
        daysBeforeDue: Number.isNaN(daysValue) ? 3 : Math.min(Math.max(daysValue, 1), 30),
        notificationEmail: config.notificationEmail.trim(),
        enabled: config.enabled,
      }

      const response = await fetch('/api/notificacoes/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }

      toast({
        title: 'Sucesso!',
        description: 'Configurações salvas com sucesso',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as configurações',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTest = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/notificacoes/test', {
        method: 'POST',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao testar notificação')
      }

      toast({
        title: result.success ? 'Sucesso!' : 'Aviso',
        description: result.message || 'Email de teste enviado',
      })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível testar a notificação',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configurações</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações por Email
          </CardTitle>
          <CardDescription>
            Configure quando e como receber notificações sobre contas próximas do vencimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="enabled">Ativar notificações</Label>
          </div>

          <div>
            <Label htmlFor="daysBeforeDue">Dias antes do vencimento</Label>
            <Input
              id="daysBeforeDue"
              type="number"
              inputMode="numeric"
              min="1"
              max="30"
              value={config.daysBeforeDue}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || (/^\d+$/.test(value) && Number(value) <= 99)) {
                  setConfig({ ...config, daysBeforeDue: value })
                }
              }}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Você receberá um email quando houver contas vencendo nos próximos X dias
            </p>
          </div>

          <div>
            <Label htmlFor="notificationEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email alternativo (opcional)
            </Label>
            <Input
              id="notificationEmail"
              type="email"
              value={config.notificationEmail}
              onChange={(e) => setConfig({ ...config, notificationEmail: e.target.value })}
              placeholder="email@exemplo.com"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Deixe em branco para usar o email da sua conta
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
            <Button onClick={handleTest} variant="outline" disabled={loading}>
              <Mail className="mr-2 h-4 w-4" />
              Testar Notificação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

