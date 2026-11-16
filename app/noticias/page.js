import Link from 'next/link';
import { db } from '@/lib/db';
import { CATEGORIAS } from '@/lib/util';
import ItemNoticia from '@/components/ItemNoticia';

export default async function Noticias({ searchParams }) {
  const sp = await searchParams;
  const cat = CATEGORIAS.includes(sp.cat) ? sp.cat : '';
  const q = String(sp.q ?? '').trim();
  const like = `%${q}%`;

  const sql = await db();
  const lista = await sql`
    SELECT n.id, n.titulo, n.categoria, n.conteudo, n.criado_em, n.atualizado_em,
           (n.imagem_base64 IS NOT NULL) AS tem_imagem, u.nome AS autor
    FROM noticias n JOIN usuarios u ON u.id = n.autor_id
    WHERE (${cat} = '' OR n.categoria = ${cat})
      AND (${q} = '' OR n.titulo ILIKE ${like} OR n.conteudo ILIKE ${like})
    ORDER BY n.id DESC`;

  return (
    <>
      <h2>{cat || 'Todas as notícias'}</h2>
      <div className="tabs">
        <Link className={cat === '' ? 'ativa' : ''} href="/noticias">
          Todas
        </Link>
        {CATEGORIAS.map((c) => (
          <Link key={c} className={cat === c ? 'ativa' : ''} href={`/noticias?cat=${encodeURIComponent(c)}`}>
            {c}
          </Link>
        ))}
      </div>
      {q && (
        <p>
          Resultados para “{q}”: {lista.length}
        </p>
      )}
      <div className="lista">
        {lista.map((n) => (
          <ItemNoticia key={n.id} n={n} />
        ))}
        {lista.length === 0 && <p>Nenhuma notícia encontrada.</p>}
      </div>
    </>
  );
}
