import { db } from './db';
import { getUser } from './auth';

// registra uma ação na auditoria (nunca derruba o site)
export async function registrar(acao, detalhe = '', usuario) {
  try {
    const sql = await db();
    const u = usuario ?? (await getUser());
    await sql`INSERT INTO auditoria (usuario_id, usuario_nome, acao, detalhe)
              VALUES (${u?.id ?? null}, ${u?.nome ?? 'Visitante'}, ${acao}, ${detalhe})`;
  } catch (e) {
    console.error('auditoria:', e);
  }
}
