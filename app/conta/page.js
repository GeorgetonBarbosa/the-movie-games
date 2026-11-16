import { db } from '@/lib/db';
import { exigeLogin } from '@/lib/auth';
import { trocarSenha } from '@/app/actions';

export default async function Conta({ searchParams }) {
  const sp = await searchParams;
  const logado = await exigeLogin();
  const sql = await db();
  const [u] = await sql`SELECT nome, email, perfil FROM usuarios WHERE id = ${logado.id}`;

  return (
    <>
      <h2>Minha conta</h2>
      <p>
        <strong>{u.nome}</strong> • {u.email} • perfil: {u.perfil}
      </p>

      <h3>Alterar senha</h3>
      {sp.erro && <p className="erro">{sp.erro}</p>}
      {sp.ok && <p className="ok">{sp.ok}</p>}
      <form action={trocarSenha}>
        <label>
          Senha atual
          <input type="password" name="atual" required />
        </label>
        <label>
          Nova senha (mínimo 6 caracteres)
          <input type="password" name="nova" required />
        </label>
        <label>
          Confirmar nova senha
          <input type="password" name="confirma" required />
        </label>
        <button className="btn">Salvar nova senha</button>
      </form>
    </>
  );
}
