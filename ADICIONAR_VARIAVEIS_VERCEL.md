# 🚀 Adicionar Variáveis de Ambiente no Vercel

## Link do Projeto
**https://financas-six-swart.vercel.app/**

## ⚡ Passos Rápidos

### 1. Acesse o Dashboard do Vercel
https://vercel.com/dashboard

### 2. Selecione o Projeto
Clique no projeto `financas` ou `financas-six-swart`

### 3. Vá em Settings > Environment Variables
No menu lateral, clique em **Settings** e depois em **Environment Variables**

### 4. Adicione as Variáveis

Clique em **Add New** e adicione cada uma das variáveis abaixo:

#### 📊 Database (Neon Postgres)

**POSTGRES_PRISMA_URL**
```
postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e-pooler.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require
```
✅ Marque: Production, Preview, Development

**POSTGRES_URL_NON_POOLING**
```
postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e.us-east-1.aws.neon.tech/neondb?sslmode=require
```
✅ Marque: Production, Preview, Development

#### 🔐 NextAuth

**NEXTAUTH_URL**
```
https://financas-six-swart.vercel.app
```
✅ Marque: Production, Preview, Development

**NEXTAUTH_SECRET**
```
NcYnaJVnUKj+6AGSaJllAYAENGqJGUj7vfaX/pqB4KQ=
```
✅ Marque: Production, Preview, Development

#### 🌐 App

**NEXT_PUBLIC_APP_URL**
```
https://financas-six-swart.vercel.app
```
✅ Marque: Production, Preview, Development

#### 📧 Resend (Email) - Opcional

**RESEND_API_KEY**
```
sua_chave_do_resend_aqui
```
✅ Marque: Production, Preview, Development

> **Nota:** Se não tiver a chave do Resend ainda, pode deixar vazio. O sistema funcionará, mas não enviará emails.

#### ⏰ Cron Secret

**CRON_SECRET**
```
uHvHbZQqDDWdGDemvYPvqEz168z4gkB65SMD38EIELY=
```
✅ Marque: Production, Preview, Development

### 5. Redeploy

Após adicionar todas as variáveis:

1. Vá em **Deployments**
2. Clique nos **três pontos** do último deployment
3. Selecione **Redeploy**
4. Aguarde o novo deploy

## ✅ Verificar se Funcionou

1. Acesse: https://financas-six-swart.vercel.app/
2. Tente criar uma conta
3. Se funcionar, está tudo configurado! 🎉

## 🔧 Via CLI (Alternativa)

Se preferir usar a CLI:

```bash
# Database
vercel env add POSTGRES_PRISMA_URL production
# Cole: postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e-pooler.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require

vercel env add POSTGRES_URL_NON_POOLING production
# Cole: postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e.us-east-1.aws.neon.tech/neondb?sslmode=require

# NextAuth
vercel env add NEXTAUTH_URL production
# Cole: https://financas-six-swart.vercel.app

vercel env add NEXTAUTH_SECRET production
# Cole: NcYnaJVnUKj+6AGSaJllAYAENGqJGUj7vfaX/pqB4KQ=

# App
vercel env add NEXT_PUBLIC_APP_URL production
# Cole: https://financas-six-swart.vercel.app

# Cron
vercel env add CRON_SECRET production
# Cole: uHvHbZQqDDWdGDemvYPvqEz168z4gkB65SMD38EIELY=

# Resend (opcional)
vercel env add RESEND_API_KEY production
# Cole sua chave do Resend
```

Repita para `preview` e `development` também!

