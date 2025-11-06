#!/bin/bash

echo "🚀 Iniciando deploy no Vercel..."
echo ""

# Secrets gerados
NEXTAUTH_SECRET="NcYnaJVnUKj+6AGSaJllAYAENGqJGUj7vfaX/pqB4KQ="
CRON_SECRET="uHvHbZQqDDWdGDemvYPvqEz168z4gkB65SMD38EIELY="

echo "📝 Secrets gerados:"
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "CRON_SECRET: $CRON_SECRET"
echo ""

echo "1️⃣  Faça login no Vercel:"
echo "   vercel login"
echo ""

echo "2️⃣  Link e faça o primeiro deploy:"
echo "   vercel"
echo "   Responda:"
echo "   - Set up and deploy? Y"
echo "   - Which scope? Sua conta"
echo "   - Link to existing project? N"
echo "   - Project name? ludvig-financas"
echo "   - Directory? ./"
echo "   - Override settings? N"
echo ""

echo "3️⃣  Após o deploy, anote a URL do projeto (ex: https://ludvig-financas.vercel.app)"
echo ""

echo "4️⃣  Crie o Postgres:"
echo "   vercel postgres create ludvig-financas"
echo ""

echo "5️⃣  Conecte o Postgres:"
echo "   vercel postgres connect"
echo "   Selecione o projeto criado"
echo ""

echo "6️⃣  Baixe as variáveis:"
echo "   vercel env pull .env.local"
echo ""

echo "7️⃣  Adicione as variáveis de ambiente:"
echo ""
echo "   vercel env add NEXTAUTH_SECRET production"
echo "   Cole: $NEXTAUTH_SECRET"
echo ""
echo "   vercel env add CRON_SECRET production"
echo "   Cole: $CRON_SECRET"
echo ""
echo "   vercel env add RESEND_API_KEY production"
echo "   Cole sua chave do Resend"
echo ""
echo "   vercel env add NEXTAUTH_URL production"
echo "   Cole: https://SEU-PROJETO.vercel.app"
echo ""
echo "   vercel env add NEXT_PUBLIC_APP_URL production"
echo "   Cole: https://SEU-PROJETO.vercel.app"
echo ""

echo "8️⃣  Deploy em produção:"
echo "   vercel --prod"
echo ""

echo "✅ Pronto! Seu projeto estará no ar!"

