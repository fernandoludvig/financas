# Guia de Deploy no Vercel

## Secrets Gerados

**NEXTAUTH_SECRET:** `NcYnaJVnUKj+6AGSaJllAYAENGqJGUj7vfaX/pqB4KQ=`
**CRON_SECRET:** `uHvHbZQqDDWdGDemvYPvqEz168z4gkB65SMD38EIELY=`

## Passos para Deploy

### 1. Login no Vercel (Interativo)
```bash
vercel login
```
- Abrirá o navegador para autenticação
- Faça login com sua conta GitHub

### 2. Link e Deploy Inicial (Interativo)
```bash
vercel
```

**Responda as perguntas:**
- Set up and deploy? **Y**
- Which scope? **Sua conta**
- Link to existing project? **N**
- Project name? **ludvig-financas** (ou o nome que preferir)
- Directory? **./**
- Override settings? **N**

### 3. Criar Postgres Database
```bash
vercel postgres create ludvig-financas
```

### 4. Conectar Postgres ao Projeto
```bash
vercel postgres connect
```
- Selecione o projeto criado

### 5. Baixar Variáveis de Ambiente
```bash
vercel env pull .env.local
```

### 6. Adicionar Variáveis de Ambiente

```bash
# NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
# Cole: NcYnaJVnUKj+6AGSaJllAYAENGqJGUj7vfaX/pqB4KQ=

# CRON_SECRET
vercel env add CRON_SECRET production
# Cole: uHvHbZqDDWdGDemvYPvqEz168z4gkB65SMD38EIELY=

# RESEND_API_KEY (você precisa ter sua chave do Resend)
vercel env add RESEND_API_KEY production
# Cole sua chave do Resend

# NEXTAUTH_URL (substitua pelo URL do seu projeto)
vercel env add NEXTAUTH_URL production
# Cole: https://ludvig-financas.vercel.app (ou o URL do seu projeto)

# NEXT_PUBLIC_APP_URL
vercel env add NEXT_PUBLIC_APP_URL production
# Cole: https://ludvig-financas.vercel.app (ou o URL do seu projeto)
```

### 7. Deploy em Produção
```bash
vercel --prod
```

## Notas Importantes

1. **Resend API Key**: Você precisa criar uma conta no [Resend](https://resend.com) e obter sua API key
2. **URL do Projeto**: Após o primeiro deploy, o Vercel fornecerá a URL do projeto
3. **Variáveis de Ambiente**: Adicione as mesmas variáveis para `preview` e `development` se necessário:
   ```bash
   vercel env add NEXTAUTH_SECRET preview
   vercel env add NEXTAUTH_SECRET development
   ```

## Após o Deploy

1. Acesse o dashboard do Vercel
2. Verifique se o Postgres foi conectado corretamente
3. Teste o sistema acessando a URL fornecida
4. Configure o domínio personalizado (opcional)

