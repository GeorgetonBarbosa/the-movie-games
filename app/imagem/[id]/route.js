import { db } from '@/lib/db';

export async function GET(_req, { params }) {
  const { id } = await params;
  const nid = Number(id);
  if (!Number.isInteger(nid)) return new Response('Não encontrada', { status: 404 });

  const sql = await db();
  const [r] = await sql`SELECT imagem_base64, imagem_tipo FROM noticias WHERE id = ${nid}`;
  if (!r || !r.imagem_base64) return new Response('Não encontrada', { status: 404 });

  return new Response(Buffer.from(r.imagem_base64, 'base64'), {
    headers: {
      'Content-Type': r.imagem_tipo || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
