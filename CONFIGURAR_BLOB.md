# 📦 Configurar Vercel Blob Storage para Comprovantes

## Para funcionar no Vercel

O upload de arquivos no Vercel requer o uso do Vercel Blob Storage, pois o sistema de arquivos é somente leitura.

### 1. Criar Blob Store no Vercel

1. Acesse: https://vercel.com/dashboard
2. Vá em **Storage** > **Create Database**
3. Selecione **Blob**
4. Dê um nome: `ludvig-financas-blob`
5. Selecione a região mais próxima
6. Clique em **Create**

### 2. Adicionar Variável de Ambiente

1. No dashboard do Vercel, vá em **Settings** > **Environment Variables**
2. Adicione:

**BLOB_READ_WRITE_TOKEN**
- Valor: Será gerado automaticamente quando você criar o Blob Store
- Ambiente: Production, Preview, Development

### 3. Obter o Token

1. No dashboard do Vercel, vá em **Storage**
2. Clique no Blob Store criado
3. Vá em **Settings** > **Environment Variables**
4. Copie o valor de `BLOB_READ_WRITE_TOKEN`
5. Adicione no Vercel como variável de ambiente

### 4. Redeploy

Após adicionar a variável:
1. Vá em **Deployments**
2. Clique nos três pontos do último deployment
3. Selecione **Redeploy**

## ✅ Como Funciona

- **Localmente**: Usa sistema de arquivos (`/public/uploads/receipts/`)
- **No Vercel**: Usa Vercel Blob Storage (se `BLOB_READ_WRITE_TOKEN` estiver configurado)

O sistema detecta automaticamente qual método usar!

## 🔍 Verificar se Está Funcionando

1. Acesse: https://financas-six-swart.vercel.app/
2. Crie ou edite uma conta
3. Faça upload de um comprovante (PDF ou imagem)
4. Se funcionar, está tudo configurado! 🎉

