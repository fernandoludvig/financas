# Ludvig Finanças

Sistema completo de gestão financeira desenvolvido com Next.js 14, TypeScript e Vercel Postgres.

## 🚀 Funcionalidades

- ✅ Autenticação JWT com NextAuth.js
- ✅ CRUD completo de contas a pagar/receber
- ✅ Dashboard com gráficos e resumo financeiro
- ✅ Notificações automáticas por email
- ✅ Relatórios mensais em PDF
- ✅ Configurações personalizadas de notificações
- ✅ Interface moderna com shadcn/ui

## 📦 Tecnologias

- **Next.js 14** (App Router, Server Actions)
- **TypeScript**
- **Prisma ORM** + Vercel Postgres
- **NextAuth.js v5**
- **Tailwind CSS** + shadcn/ui
- **Resend** (emails)
- **jsPDF** (relatórios)
- **Recharts** (gráficos)

## 🛠️ Instalação

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd ludvig-financas
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` baseado no `.env.example`:

```env
# Database (Vercel Postgres)
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="" # openssl rand -base64 32

# Resend (Email)
RESEND_API_KEY=""

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron Secret
CRON_SECRET="" # openssl rand -base64 32
```

### 4. Configure o banco de dados

```bash
npx prisma generate
npx prisma db push
```

### 5. Execute o projeto

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy no Vercel

### 1. Conecte o repositório

- Faça push do código para o GitHub
- Importe o projeto no Vercel

### 2. Configure o Vercel Postgres

- Crie um banco Vercel Postgres no dashboard
- As variáveis de conexão serão adicionadas automaticamente

### 3. Adicione as variáveis de ambiente

No dashboard da Vercel, adicione:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (URL do seu app na Vercel)
- `RESEND_API_KEY`
- `CRON_SECRET`
- `NEXT_PUBLIC_APP_URL` (URL do seu app na Vercel)

### 4. Deploy

```bash
vercel --prod
```

## 📧 Configuração do Resend

1. Crie uma conta no [Resend](https://resend.com)
2. Configure um domínio verificado
3. Adicione a API key no `.env.local` e na Vercel
4. Atualize o email `from` em `lib/email/send.ts` com seu domínio

## ⏰ Cron Jobs

O sistema possui um cron job configurado para executar diariamente às 8h da manhã e enviar notificações de contas próximas do vencimento.

A configuração está em `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/notificacoes",
      "schedule": "0 8 * * *"
    }
  ]
}
```

## 📝 Estrutura do Projeto

```
app/
├── (auth)/          # Páginas de autenticação
├── (dashboard)/     # Páginas protegidas
├── api/             # API Routes
└── layout.tsx       # Layout raiz

components/
├── ui/              # Componentes shadcn/ui
├── dashboard/       # Componentes do dashboard
├── contas/          # Componentes de contas
└── layout/          # Componentes de layout

lib/
├── auth.ts          # Configuração NextAuth
├── prisma.ts        # Cliente Prisma
├── validations.ts   # Schemas Zod
├── email/           # Sistema de email
└── pdf/             # Geração de PDF
```

## 🔐 Segurança

- Senhas são hasheadas com bcrypt
- Autenticação JWT via NextAuth
- Validação de dados com Zod
- Proteção de rotas no servidor
- Headers de segurança configurados

## 📄 Licença

Este projeto é privado e proprietário.

