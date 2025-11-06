# Configuração de Variáveis de Ambiente no Vercel

## URL do Projeto
https://financas-six-swart.vercel.app/

## Variáveis de Ambiente Necessárias

Acesse o dashboard do Vercel: https://vercel.com/dashboard
Selecione o projeto `financas` e vá em **Settings > Environment Variables**

### 1. Database (Neon Postgres)

```env
POSTGRES_PRISMA_URL=postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e-pooler.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
POSTGRES_URL_NON_POOLING=postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Importante:** Adicione essas variáveis para **Production**, **Preview** e **Development**

### 2. NextAuth

```env
NEXTAUTH_URL=https://financas-six-swart.vercel.app
NEXTAUTH_SECRET=NcYnaJVnUKj+6AGSaJllAYAENGqJGUj7vfaX/pqB4KQ=
```

### 3. App

```env
NEXT_PUBLIC_APP_URL=https://financas-six-swart.vercel.app
```

### 4. Resend (Email)

```env
RESEND_API_KEY=sua_chave_do_resend_aqui
```

### 5. Cron Secret

```env
CRON_SECRET=uHvHbZQqDDWdGDemvYPvqEz168z4gkB65SMD38EIELY=
```

## Como Adicionar no Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto `financas`
3. Vá em **Settings > Environment Variables**
4. Clique em **Add New**
5. Adicione cada variável:
   - **Key**: Nome da variável (ex: `POSTGRES_PRISMA_URL`)
   - **Value**: Valor da variável
   - **Environment**: Selecione **Production**, **Preview** e **Development**
6. Clique em **Save**
7. Repita para todas as variáveis

## Após Adicionar as Variáveis

1. Vá em **Deployments**
2. Clique nos três pontos do último deployment
3. Selecione **Redeploy**
4. Aguarde o novo deploy

## Verificar se Está Funcionando

1. Acesse: https://financas-six-swart.vercel.app/
2. Tente criar uma conta
3. Se funcionar, o banco de dados está configurado corretamente!

## Comandos Úteis

### Ver variáveis locais
```bash
vercel env pull .env.local
```

### Adicionar variável via CLI
```bash
vercel env add POSTGRES_PRISMA_URL production
# Cole o valor quando solicitado
```

