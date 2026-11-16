import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { exigeAdm } from '@/lib/auth';
import NoticiaForm from '@/components/NoticiaForm';

export default async function Editar({ params, searchParams }) {
  await exigeAdm();
  const { id } = await params;
  const sp = await searchParams;
  const nid = Number(id);
  if (!Number.isInteger(nid)) notFound();

  const sql = await db();
  const [n] = await sql`
    SELECT id, titulo, categoria, conteudo, atualizado_em, (imagem_base64 IS NOT NULL) AS tem_imagem
    FROM noticias WHERE id = ${nid}`;
  if (!n) notFound();

  return (
    <>
      <h2>Editar notícia</h2>
      <NoticiaForm noticia={n} erro={sp.erro} />
    </>
  );
}
