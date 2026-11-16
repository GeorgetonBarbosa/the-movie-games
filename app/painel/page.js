import Link from 'next/link';
import { db } from '@/lib/db';
import { exigeAdm } from '@/lib/auth';
import { dataBR } from '@/lib/util';
import { excluirNoticia } from '@/app/actions';
import FormExcluir from '@/components/FormExcluir';

export default async function Painel() {
  await exigeAdm();
  const sql = await db();
  const noticias = await sql`SELECT id, titulo, categoria, criado_em FROM noticias ORDER BY id DESC`;

  return (
    <>
      <div className="topo">
        <h2>Painel de notícias</h2>
        <Link className="btn" href="/painel/nova">
          + Nova notícia
        </Link>
      </div>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {noticias.map((n) => (
            <tr key={n.id}>
              <td>{n.titulo}</td>
              <td>{n.categoria}</td>
              <td>{dataBR(n.criado_em)}</td>
              <td>
                <Link href={`/painel/editar/${n.id}`}>Editar</Link>
                <FormExcluir action={excluirNoticia} campos={{ id: n.id }} mensagem="Excluir esta notícia?" />
              </td>
            </tr>
          ))}
          {noticias.length === 0 && (
            <tr>
              <td colSpan={4}>Nenhuma notícia cadastrada.</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}
