import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const NOME = 'sessao';

function chave() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error('Defina AUTH_SECRET nas variáveis de ambiente.');
  return new TextEncoder().encode(s);
}

export async function criarSessao(u) {
  const token = await new SignJWT({ id: u.id, nome: u.nome, perfil: u.perfil })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(chave());
  const c = await cookies();
  c.set(NOME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function encerrarSessao() {
  const c = await cookies();
  c.delete(NOME);
}

// usuário logado (ou null)
export async function getUser() {
  const c = await cookies();
  const token = c.get(NOME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave());
    return { id: Number(payload.id), nome: payload.nome, perfil: payload.perfil };
  } catch {
    return null;
  }
}

export async function exigeLogin() {
  const u = await getUser();
  if (!u) redirect('/login');
  return u;
}

export async function exigeAdm() {
  const u = await getUser();
  if (!u || u.perfil !== 'adm') redirect('/login');
  return u;
}
