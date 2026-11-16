import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { entrar } from '@/app/actions';

export default async function Login({ searchParams }) {
  const sp = await searchParams;
  const u = await getUser();
  if (u) redirect(u.perfil === 'adm' ? '/painel' : '/');

  return (
    <>
      <h2>Entrar</h2>
      {sp.erro && <p className="erro">{sp.erro}</p>}
      <form action={entrar}>
        <label>
          E-mail
          <input type="email" name="email" required />
        </label>
        <label>
          Senha
          <input type="password" name="senha" required />
        </label>
        <button className="btn">Entrar</button>
        <small>
          Ainda não tem conta? <Link href="/register">Cadastre-se</Link>
        </small>
      </form>
    </>
  );
}
