import { resend } from './client'
import NotificacaoVencimento from './templates/notificacao-vencimento'
import BemVindo from './templates/bem-vindo'

export async function sendBillNotification(
  to: string,
  userName: string,
  bills: any[]
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurada. Email não será enviado.')
    return { success: false, error: 'RESEND_API_KEY não configurada' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sistema Financeiro <notificacoes@seudominio.com>',
      to,
      subject: `${bills.length} conta(s) próximas do vencimento`,
      react: NotificacaoVencimento({ userName, bills }),
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(
  to: string,
  userName: string
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY não configurada. Email não será enviado.')
    return { success: false, error: 'RESEND_API_KEY não configurada' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Sistema Financeiro <notificacoes@seudominio.com>',
      to,
      subject: 'Bem-vindo ao Sistema Financeiro',
      react: BemVindo({ userName }),
    })

    if (error) {
      console.error('Erro ao enviar email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return { success: false, error }
  }
}

