import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
} from '@react-email/components'

interface BemVindoProps {
  userName: string
}

export default function BemVindo({ userName }: BemVindoProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>Bem-vindo, {userName}!</Text>
          <Text style={paragraph}>
            Seu cadastro foi realizado com sucesso no Sistema Financeiro.
          </Text>
          <Text style={paragraph}>
            Agora você pode gerenciar suas contas a pagar e receber de forma simples e eficiente.
          </Text>
          <Button href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} style={button}>
            Acessar Sistema
          </Button>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: 'sans-serif' }
const container = { margin: '0 auto', padding: '20px 0 48px', maxWidth: '600px' }
const heading = { fontSize: '24px', fontWeight: 'bold', color: '#333' }
const paragraph = { fontSize: '16px', lineHeight: '26px', color: '#666', marginBottom: '16px' }
const button = { backgroundColor: '#3498db', color: '#fff', padding: '12px 20px', borderRadius: '6px', textDecoration: 'none', display: 'inline-block' }

