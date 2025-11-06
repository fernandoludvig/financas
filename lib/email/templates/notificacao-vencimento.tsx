import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface NotificacaoVencimentoProps {
  userName: string
  bills: {
    description: string
    amount: number
    dueDate: Date
    daysUntilDue: number
  }[]
}

export default function NotificacaoVencimento({
  userName,
  bills,
}: NotificacaoVencimentoProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Olá, {userName}!</Text>
          <Text style={paragraph}>
            Você tem {bills.length} conta(s) próximas do vencimento:
          </Text>
          
          {bills.map((bill, index) => (
            <Section key={index} style={billSection}>
              <Text style={billDescription}>{bill.description}</Text>
              <Text style={billAmount}>
                R$ {bill.amount.toFixed(2)}
              </Text>
              <Text style={billDueDate}>
                Vence em {bill.daysUntilDue} dias
              </Text>
            </Section>
          ))}
          
          <Hr style={hr} />
          
          <Button href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} style={button}>
            Ver Minhas Contas
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }
const heading = { fontSize: '24px', fontWeight: 'bold', color: '#333' }
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#666' }
const billSection = { padding: '12px', backgroundColor: '#fff', borderRadius: '8px', marginBottom: '12px' }
const billDescription = { fontSize: '16px', fontWeight: '600', margin: '0', color: '#333' }
const billAmount = { fontSize: '20px', color: '#e74c3c', margin: '4px 0', fontWeight: 'bold' }
const billDueDate = { fontSize: '14px', color: '#7f8c8d', margin: '0' }
const hr = { borderColor: '#e6ebf1', margin: '20px 0' }
const button = { backgroundColor: '#3498db', color: '#fff', padding: '12px 20px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }

