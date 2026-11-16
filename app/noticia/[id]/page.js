import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { dataBR, imgSrc } from '@/lib/util';
import { comentar, excluirComentario } from '@/app/actions';
import FormExcluir from '@/components/FormExcluir';

export default async function Noticia({ params }) {
  const { id } = await params;
  const nid = Number(id);
  if (!Number.isInteger(nid)) notFound();

  const sql = await db();
  const [n] = await sql`
    SELECT n.id, n.titulo, n.categoria, n.conteudo, n.criado_em, n.atualizado_em,
           (n.imagem_base64 IS NOT NULL) AS tem_imagem, u.nome AS autor
    FROM noticias n JOIN usuarios u ON u.id = n.autor_id WHERE n.id = ${nid}`;
  if (!n) notFound();

  const comentarios = await sql`
    SELECT c.id, c.texto, c.criado_em, c.usuario_id, u.nome
    FROM comentarios c JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.noticia_id = ${nid} ORDER BY c.id DESC`;
  const u = await getUser();
  const editada = new Date(n.atualizado_em).getTime() - new Date(n.criado_em).getTime() > 2000;

  return (
    <>
      <article className="noticia">
        <small>
          {n.categoria} • {dataBR(n.criado_em)} • por {n.autor}
          {editada && ` • atualizada em ${dataBR(n.atualizado_em)}`}
        </small>
        <h1>{n.titulo}</h1>
        {n.tem_imagem && <img src={imgSrc(n)} alt="" />}
        <p style={{ whiteSpace: 'pre-line' }}>{n.conteudo}</p>
        <Link href="/noticias">← Voltar</Link>
      </article>

      <section className="comentarios">
        <h3>Comentários ({comentarios.length})</h3>
        {u ? (
          <form action={comentar}>
            <input type="hidden" name="noticia_id" value={n.id} />
            <label>
              Deixe seu comentário
              <textarea name="texto" rows={3} maxLength={500} required />
            </label>
            <button className="btn">Comentar</button>
          </form>
        ) : (
          <p>
            <Link href="/login">Entre</Link> ou <Link href="/register">cadastre-se</Link> para comentar.
          </p>
        )}

        {comentarios.map((c) => (
          <div className="comentario" key={c.id}>
            <small>
              <strong>{c.nome}</strong> • {dataBR(c.criado_em)}
            </small>
            <p style={{ whiteSpace: 'pre-line' }}>{c.texto}</p>
            {u && (u.perfil === 'adm' || u.id === c.usuario_id) && (
              <FormExcluir
                action={excluirComentario}
                campos={{ id: c.id, noticia_id: n.id }}
                mensagem="Excluir este comentário?"
              />
            )}
          </div>
        ))}
      </section>
    </>
  );
}
