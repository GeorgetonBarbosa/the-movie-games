import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL);
let pronto = null;

async function preparar() {
  await sql`CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL DEFAULT 'user',
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    categoria TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    imagem_base64 TEXT,
    imagem_tipo TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    autor_id INTEGER NOT NULL REFERENCES usuarios(id)
  )`;
  await sql`CREATE TABLE IF NOT EXISTS comentarios (
    id SERIAL PRIMARY KEY,
    noticia_id INTEGER NOT NULL REFERENCES noticias(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    texto TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER,
    usuario_nome TEXT NOT NULL,
    acao TEXT NOT NULL,
    detalhe TEXT,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`;

  // cria o administrador na primeira execução
  const [r] = await sql`SELECT COUNT(*)::int AS n FROM usuarios WHERE perfil = 'adm'`;
  if (r.n === 0) {
    const email = (process.env.ADMIN_EMAIL || 'admin@themoviegames.com').toLowerCase();
    const hash = await bcrypt.hash(process.env.ADMIN_SENHA || 'admin123', 10);
    await sql`INSERT INTO usuarios (nome, email, senha, perfil)
              VALUES ('Administrador', ${email}, ${hash}, 'adm')
              ON CONFLICT (email) DO NOTHING`;
  }
}

// devolve o cliente do banco já com as tabelas prontas
export async function db() {
  if (!pronto) {
    pronto = preparar().catch((e) => {
      pronto = null;
      throw e;
    });
  }
  await pronto;
  return sql;
}
