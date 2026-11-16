import Link from 'next/link';
import { db } from '@/lib/db';
import { CATEGORIAS, imgSrc } from '@/lib/util';
import ItemNoticia from '@/components/ItemNoticia';

export default async function Home() {
  const sql = await db();
  const todas = await sql`
    SELECT n.id, n.titulo, n.categoria, n.conteudo, n.criado_em, n.atualizado_em,
           (n.imagem_base64 IS NOT NULL) AS tem_imagem, u.nome AS autor
    FROM noticias n JOIN usuarios u ON u.id = n.autor_id
    ORDER BY n.id DESC LIMIT 15`;
  const alta = await sql`
    SELECT n.id, n.titulo, COUNT(c.id)::int AS qtd
    FROM noticias n LEFT JOIN comentarios c ON c.noticia_id = n.id
    GROUP BY n.id ORDER BY qtd DESC, n.id DESC LIMIT 5`;
  const destaques = todas.slice(0, 5);
  const recentes = todas.slice(5);

  return (
    <>
      <section className="hero">
        <h1>
          The Movie <span>Games</span>
        </h1>
        <p>Tudo sobre o universo dos games e do cinema: lançamentos, curiosidades e as notícias mais quentes.</p>
      </section>

      {destaques.length > 0 ? (
        <section className="destaque">
          {destaques.map((n, i) => (
            <Link key={n.id} className={`d-card ${i === 0 ? 'd-grande' : ''}`} href={`/noticia/${n.id}`}>
              {n.tem_imagem && <img src={imgSrc(n)} alt="" />}
              <div className="d-info">
                <span className="tag">{n.categoria}</span>
                <h2>{n.titulo}</h2>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <p>Ainda não há notícias publicadas.</p>
      )}

      <div className="colunas">
        <section>
          <h2 className="titulo-sec">Mais recentes</h2>
          <div className="lista">
            {recentes.map((n) => (
              <ItemNoticia key={n.id} n={n} />
            ))}
            {recentes.length === 0 && destaques.length > 0 && (
              <p>
                Veja todas as notícias na página <Link href="/noticias">Notícias</Link>.
              </p>
            )}
          </div>
          <p>
            <Link className="btn" href="/noticias">
              Ver todas as notícias
            </Link>
          </p>
        </section>

        <aside>
          <h2 className="titulo-sec">Em alta</h2>
          <ol className="alta">
            {alta.map((a) => (
              <li key={a.id}>
                <Link href={`/noticia/${a.id}`}>{a.titulo}</Link>
                {a.qtd > 0 && <small>{a.qtd} comentário(s)</small>}
              </li>
            ))}
            {alta.length === 0 && <li>Sem notícias ainda.</li>}
          </ol>

          <h2 className="titulo-sec">Categorias</h2>
          <div className="chips">
            {CATEGORIAS.map((c) => (
              <Link key={c} href={`/noticias?cat=${encodeURIComponent(c)}`}>
                {c}
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <section className="sobre">
        <h2>Sobre a página</h2>
        <p>
          A The Movie Games nasceu no Instagram para falar de games e filmes de um jeito direto e divertido. Este site
          reúne as notícias em um só lugar.
        </p>
      </section>
    </>
  );
}
