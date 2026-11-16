import { db } from '@/lib/db';
import { exigeAdm } from '@/lib/auth';
import { dataBR } from '@/lib/util';

export default async function Usuarios() {
  await exigeAdm();
  const sql = await db();
  const usuarios = await sql`SELECT id, nome, email, perfil, criado_em FROM usuarios ORDER BY id DESC`;

  return (
    <>
      <h2>Usuários cadastrados ({usuarios.length})</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Perfil</th>
            <th>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.perfil}</td>
              <td>{dataBR(u.criado_em)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
