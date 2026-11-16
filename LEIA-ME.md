# The Movie Games (Next.js + PostgreSQL)

Site de notícias de games e cinema, com landing page, login com perfis (adm e user),
CRUD de notícias com foto, comentários, usuários, auditoria e troca de senha.

Tecnologias: Next.js (App Router), PostgreSQL na nuvem (Neon), sessão com cookie (jose) e senhas com bcrypt.
As fotos ficam guardadas no próprio banco (até 2 MB cada).

## 1) Criar o banco gratuito (Neon)
1. Acesse neon.tech e crie uma conta.
2. Crie um projeto (qualquer nome).
3. No painel, copie a **Connection string** (começa com `postgresql://`).

## 2) Rodar no seu computador
1. Instale o Node.js (versão LTS) em nodejs.org.
2. Na pasta do projeto, copie `.env.example` para `.env.local` e preencha:
   - `DATABASE_URL`: a connection string do Neon
   - `AUTH_SECRET`: gere com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `ADMIN_EMAIL` e `ADMIN_SENHA`: login do administrador
3. Rode:
   ```
   npm install
   npm run dev
   ```
4. Abra http://localhost:3000

As tabelas e o administrador são criados sozinhos no primeiro acesso.

## 3) Publicar na Vercel
1. Crie um repositório no GitHub e envie esta pasta (sem `node_modules`; o `.gitignore` já cuida disso).
2. Na Vercel: **Add New > Project**, escolha o repositório.
3. Em **Environment Variables**, cadastre as mesmas 4 variáveis do `.env.local`.
   Defina `ADMIN_SENHA` ANTES do primeiro acesso, porque o adm é criado nesse momento.
4. Clique em **Deploy** e acesse o endereço gerado.

## Perfis
- visitante: lê notícias e comentários
- user: cadastra-se, comenta, apaga os próprios comentários, troca a senha
- adm: painel de notícias (criar, editar, excluir), usuários, auditoria, apaga qualquer comentário

## Problemas comuns
- "DATABASE_URL" vazio: confira o `.env.local` (local) ou as variáveis na Vercel (online).
- Não consegue entrar como adm: o adm só é criado se o banco ainda não tiver nenhum. Para recomeçar, apague as tabelas no painel do Neon.
- Foto não envia: use JPG, PNG, WEBP ou GIF de até 2 MB.
