# Como Configurar Upload de Arquivos no Vercel

## Problema
No Vercel, o sistema de arquivos é somente leitura, então não é possível salvar arquivos localmente. Para fazer upload de arquivos (comprovantes), é necessário usar o **Vercel Blob Storage**.

## Solução

### 1. Criar Blob Store no Vercel

1. Acesse o [Dashboard do Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Storage** (no menu lateral)
4. Clique em **Create Database**
5. Selecione **Blob**
6. Escolha um nome (ex: `ludvig-financas-blob`)
7. Selecione a região mais próxima
8. Clique em **Create**

### 2. Configurar Variável de Ambiente

Após criar o Blob Store, o Vercel automaticamente cria a variável `BLOB_READ_WRITE_TOKEN`.

1. Vá em **Settings** > **Environment Variables**
2. Verifique se `BLOB_READ_WRITE_TOKEN` está configurada
3. Se não estiver, adicione manualmente:
   - **Name**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Copie o token do Blob Store criado
   - **Environments**: Selecione Production, Preview e Development

### 3. Fazer Redeploy

Após configurar a variável de ambiente:

1. Vá em **Deployments**
2. Clique nos três pontos (...) do último deployment
3. Selecione **Redeploy**
4. Ou faça um novo commit e push para o GitHub

## Como Funciona

- **Em Produção (Vercel)**: Usa Vercel Blob Storage automaticamente
- **Em Desenvolvimento Local**: Usa sistema de arquivos local (`/public/uploads/receipts/`)

## Verificação

Após configurar, teste fazendo upload de um comprovante:
1. Acesse a página de Contas
2. Clique em "Nova Conta"
3. Tente fazer upload de um arquivo PDF ou imagem
4. Se funcionar, você verá "Comprovante enviado com sucesso"

## Troubleshooting

### Erro: "Upload não configurado"
- Verifique se `BLOB_READ_WRITE_TOKEN` está configurada no Vercel
- Verifique se fez redeploy após configurar a variável

### Erro: "Erro ao fazer upload no Vercel Blob"
- Verifique se o Blob Store está ativo no Vercel
- Verifique se o token está correto
- Verifique os logs do Vercel para mais detalhes

