# Configuração do Banco de Dados

## Opção 1: PostgreSQL Local

1. Instale o PostgreSQL:
   - macOS: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql`
   - Windows: Baixe do site oficial

2. Inicie o PostgreSQL:
   ```bash
   brew services start postgresql@14  # macOS
   # ou
   sudo systemctl start postgresql    # Linux
   ```

3. Crie o banco de dados:
   ```bash
   createdb ludvig_financas
   ```

4. Atualize o `.env.local`:
   ```env
   POSTGRES_PRISMA_URL="postgresql://seu_usuario:sua_senha@localhost:5432/ludvig_financas?schema=public"
   POSTGRES_URL_NON_POOLING="postgresql://seu_usuario:sua_senha@localhost:5432/ludvig_financas?schema=public"
   ```

5. Execute as migrações:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Opção 2: Vercel Postgres (Recomendado para Produção)

1. Crie um projeto no Vercel
2. Adicione o Vercel Postgres no dashboard
3. Copie as variáveis de ambiente para o `.env.local`
4. Execute:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Opção 3: Docker (Mais Rápido)

1. Execute:
   ```bash
   docker run --name ludvig-postgres -e POSTGRES_PASSWORD=senha123 -e POSTGRES_DB=ludvig_financas -p 5432:5432 -d postgres:14
   ```

2. Atualize o `.env.local`:
   ```env
   POSTGRES_PRISMA_URL="postgresql://postgres:senha123@localhost:5432/ludvig_financas?schema=public"
   POSTGRES_URL_NON_POOLING="postgresql://postgres:senha123@localhost:5432/ludvig_financas?schema=public"
   ```

3. Execute:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

