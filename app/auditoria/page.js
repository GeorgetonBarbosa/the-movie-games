import { db } from '@/lib/db';
import { exigeAdm } from '@/lib/auth';
import { dataBR } from '@/lib/util';

export default async function Auditoria({ searchParams }) {
  await exigeAdm();
  const sp = await searchParams;
  const sql = await db();
  const acoesRows = await sql`SELECT DISTINCT acao FROM auditoria ORDER BY acao`;
  const acoes = acoesRows.map((r) => r.acao);
  const acao = acoes.includes(sp.acao) ? sp.acao : '';

  const logs = await sql`
    SELECT id, usuario_nome, acao, detalhe, criado_em FROM auditoria
    WHERE (${acao} = '' OR acao = ${acao})
    ORDER BY id DESC LIMIT 300`;

  return (
    <>
      <h2>Auditoria do sistema</h2>
      <p>Registro de tudo que acontece: cadastros, logins, notícias e comentários (últimos 300).</p>
      <form method="get" style={{ flexDirection: 'row', alignItems: 'center', maxWidth: 'none' }}>
        <select name="acao" defaultValue={acao}>
          <option value="">Todas as ações</option>
          {acoes.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button className="btn">Filtrar</button>
      </form>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Usuário</th>
            <th>Ação</th>
            <th>Detalhe</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <td>{dataBR(l.criado_em)}</td>
              <td>{l.usuario_nome}</td>
              <td>{l.acao}</td>
              <td>{l.detalhe}</td>
            </tr>
          ))}
          {logs.length === 0 && (
            <tr>
              <td colSpan={4}>Nenhum registro ainda.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
