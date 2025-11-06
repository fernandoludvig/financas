# 🗄️ Criar Tabelas no Banco de Dados Neon

## Problema
A tabela `public.users` não existe no banco de dados. Isso acontece porque o schema do Prisma ainda não foi aplicado ao banco Neon.

## ✅ Solução

### Opção 1: Via CLI Local (Recomendado)

1. **Certifique-se que o `.env.local` está configurado** com as credenciais do Neon:
```env
POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e-pooler.us-east-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"
POSTGRES_URL_NON_POOLING="postgresql://neondb_owner:npg_G4lEJdsR1QMK@ep-dry-frost-a4ncso8e.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

2. **Execute o comando para criar as tabelas:**
```bash
cd "/Users/manoellaludvig/Ludvig Finanças"
npx prisma db push
```

3. **Aguarde a confirmação:**
```
✔ Your database is now in sync with your Prisma schema.
```

### Opção 2: Via Vercel CLI

1. **Baixe as variáveis de ambiente:**
```bash
cd "/Users/manoellaludvig/Ludvig Finanças"
vercel env pull .env.local
```

2. **Execute o comando:**
```bash
npx prisma db push
```

### Opção 3: Via SQL Direto no Neon Dashboard

1. Acesse o dashboard do Neon: https://console.neon.tech/
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Execute o seguinte SQL:

```sql
-- Criar tabela users
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Criar índice único para email
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- Criar tabela bills
CREATE TABLE IF NOT EXISTS "bills" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "category" TEXT,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bills_pkey" PRIMARY KEY ("id")
);

-- Criar índices para bills
CREATE INDEX IF NOT EXISTS "bills_userId_dueDate_idx" ON "bills"("userId", "dueDate");
CREATE INDEX IF NOT EXISTS "bills_userId_status_idx" ON "bills"("userId", "status");

-- Criar foreign key
ALTER TABLE "bills" ADD CONSTRAINT "bills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Criar tabela notification_configs
CREATE TABLE IF NOT EXISTS "notification_configs" (
    "id" TEXT NOT NULL,
    "daysBeforeDue" INTEGER NOT NULL DEFAULT 3,
    "notificationEmail" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "lastNotification" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_configs_pkey" PRIMARY KEY ("id")
);

-- Criar índice único para userId
CREATE UNIQUE INDEX IF NOT EXISTS "notification_configs_userId_key" ON "notification_configs"("userId");

-- Criar foreign key
ALTER TABLE "notification_configs" ADD CONSTRAINT "notification_configs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## ✅ Verificar se Funcionou

1. Acesse: https://financas-six-swart.vercel.app/
2. Tente criar uma conta
3. Se funcionar, as tabelas foram criadas com sucesso! 🎉

## 🔍 Verificar Tabelas Criadas

Você pode verificar se as tabelas foram criadas usando o SQL Editor do Neon:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deve retornar:
- users
- bills
- notification_configs

