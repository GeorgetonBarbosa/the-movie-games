import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { cadastrar } from '@/app/actions';

export default async function Register({ searchParams }) {
  const sp = await searchParams;
  if (await getUser()) redirect('/');

  return (
    <>
      <h2>Criar conta</h2>
      {sp.erro && <p className="erro">{sp.erro}</p>}
      <form action={cadastrar}>
        <label>
          Nome
          <input name="nome" required />
        </label>
        <label>
          E-mail
          <input type="email" name="email" required />
        </label>
        <label>
          Senha (mínimo 6 caracteres)
          <input type="password" name="senha" required />
        </label>
        <button className="btn">Cadastrar</button>
      </form>
    </>
  );
}
