'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { criarSessao, encerrarSessao, getUser, exigeLogin, exigeAdm } from '@/lib/auth';
import { registrar } from '@/lib/audit';
import { CATEGORIAS, TIPOS_IMAGEM } from '@/lib/util';

const texto = (fd, campo) => String(fd.get(campo) ?? '').trim();
const msg = (m) => encodeURIComponent(m);

// ---------- usuários ----------
export async function cadastrar(fd) {
  const nome = texto(fd, 'nome');
  const email = texto(fd, 'email').toLowerCase();
  const senha = String(fd.get('senha') ?? '');
  if (!nome || !/^\S+@\S+\.\S+$/.test(email) || senha.length < 6) {
    redirect('/register?erro=' + msg('Preencha tudo corretamente (senha com no mínimo 6 caracteres).'));
  }
  const sql = await db();
  const existe = await sql`SELECT id FROM usuarios WHERE email = ${email}`;
  if (existe.length) redirect('/register?erro=' + msg('Este e-mail já está cadastrado.'));

  const hash = await bcrypt.hash(senha, 10);
  // todo cadastro público recebe o perfil "user"
  const [u] = await sql`INSERT INTO usuarios (nome, email, senha, perfil)
                        VALUES (${nome}, ${email}, ${hash}, 'user') RETURNING id, nome, perfil`;
  await criarSessao(u);
  await registrar('Cadastro de usuário', email, u);
  redirect('/');
}

export async function entrar(fd) {
  const email = texto(fd, 'email').toLowerCase();
  const senha = String(fd.get('senha') ?? '');
  const sql = await db();
  const [u] = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
  if (u && (await bcrypt.compare(senha, u.senha))) {
    await criarSessao(u);
    await registrar('Login', 'perfil: ' + u.perfil, u);
    redirect(u.perfil === 'adm' ? '/painel' : '/');
  }
  await registrar('Tentativa de login falhou', email);
  redirect('/login?erro=' + msg('E-mail ou senha inválidos.'));
}

export async function sair() {
  await registrar('Logout');
  await encerrarSessao();
  redirect('/');
}

export async function trocarSenha(fd) {
  const u = await exigeLogin();
  const atual = String(fd.get('atual') ?? '');
  const nova = String(fd.get('nova') ?? '');
  const confirma = String(fd.get('confirma') ?? '');
  const sql = await db();
  const [r] = await sql`SELECT senha FROM usuarios WHERE id = ${u.id}`;

  if (!r || !(await bcrypt.compare(atual, r.senha))) {
    await registrar('Troca de senha falhou', 'senha atual incorreta', u);
    redirect('/conta?erro=' + msg('A senha atual está incorreta.'));
  }
  if (nova.length < 6) redirect('/conta?erro=' + msg('A nova senha precisa ter no mínimo 6 caracteres.'));
  if (nova !== confirma) redirect('/conta?erro=' + msg('A confirmação não é igual à nova senha.'));
  if (nova === atual) redirect('/conta?erro=' + msg('A nova senha precisa ser diferente da atual.'));

  const hash = await bcrypt.hash(nova, 10);
  await sql`UPDATE usuarios SET senha = ${hash} WHERE id = ${u.id}`;
  await registrar('Senha alterada', '', u);
  redirect('/conta?ok=' + msg('Senha alterada com sucesso!'));
}

// ---------- notícias (somente adm) ----------
export async function salvarNoticia(fd) {
  const adm = await exigeAdm();
  const id = Number(fd.get('id') || 0);
  const titulo = texto(fd, 'titulo');
  const categoria = texto(fd, 'categoria');
  const conteudo = texto(fd, 'conteudo');
  const arq = fd.get('imagem');

  const destino = id ? `/painel/editar/${id}` : '/painel/nova';
  const voltar = (m) => redirect(destino + '?erro=' + msg(m));

  if (!titulo || !conteudo || !CATEGORIAS.includes(categoria)) {
    voltar('Título, categoria e conteúdo são obrigatórios.');
  }

  let b64 = null;
  let tipo = null;
  if (arq && typeof arq === 'object' && arq.size > 0) {
    if (!TIPOS_IMAGEM.includes(arq.type)) voltar('A imagem precisa ser JPG, PNG, WEBP ou GIF.');
    if (arq.size > 2 * 1024 * 1024) voltar('A imagem passa de 2 MB. Escolha uma menor.');
    b64 = Buffer.from(await arq.arrayBuffer()).toString('base64');
    tipo = arq.type;
  }

  const sql = await db();

  if (id) {
    // UPDATE
    const [antiga] = await sql`SELECT titulo, categoria, conteudo FROM noticias WHERE id = ${id}`;
    if (!antiga) redirect('/painel');

    if (b64) {
      await sql`UPDATE noticias SET titulo = ${titulo}, categoria = ${categoria}, conteudo = ${conteudo},
                imagem_base64 = ${b64}, imagem_tipo = ${tipo}, atualizado_em = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE noticias SET titulo = ${titulo}, categoria = ${categoria}, conteudo = ${conteudo},
                atualizado_em = NOW() WHERE id = ${id}`;
    }

    const mudancas = [];
    if (antiga.titulo !== titulo) mudancas.push(`título: "${antiga.titulo}" → "${titulo}"`);
    if (antiga.categoria !== categoria) mudancas.push(`categoria: ${antiga.categoria} → ${categoria}`);
    if (antiga.conteudo !== conteudo) mudancas.push('conteúdo alterado');
    if (b64) mudancas.push('foto trocada');
    await registrar(
      'Notícia editada',
      `#${id} — ${titulo}` + (mudancas.length ? ' | ' + mudancas.join('; ') : ''),
      adm
    );
  } else {
    // CREATE
    if (!b64) voltar('Escolha uma imagem para a notícia.');
    const [n] = await sql`INSERT INTO noticias (titulo, categoria, conteudo, imagem_base64, imagem_tipo, autor_id)
                          VALUES (${titulo}, ${categoria}, ${conteudo}, ${b64}, ${tipo}, ${adm.id}) RETURNING id`;
    await registrar('Notícia criada', `#${n.id} — ${titulo}`, adm);
  }
  redirect('/painel');
}

export async function excluirNoticia(fd) {
  const adm = await exigeAdm();
  const id = Number(fd.get('id') || 0);
  const sql = await db();
  const [n] = await sql`SELECT titulo FROM noticias WHERE id = ${id}`;
  if (n) {
    await sql`DELETE FROM noticias WHERE id = ${id}`; // apaga os comentários junto (CASCADE)
    await registrar('Notícia excluída', `#${id} — ${n.titulo}`, adm);
  }
  redirect('/painel');
}

// ---------- comentários ----------
export async function comentar(fd) {
  const u = await getUser();
  if (!u) redirect('/login');
  const nid = Number(fd.get('noticia_id') || 0);
  const t = texto(fd, 'texto');
  const sql = await db();
  const [n] = await sql`SELECT titulo FROM noticias WHERE id = ${nid}`;
  if (n && t && t.length <= 500) {
    await sql`INSERT INTO comentarios (noticia_id, usuario_id, texto) VALUES (${nid}, ${u.id}, ${t})`;
    await registrar('Comentário criado', `na notícia #${nid} — ${n.titulo}`, u);
  }
  redirect(`/noticia/${nid}`);
}

export async function excluirComentario(fd) {
  const u = await getUser();
  if (!u) redirect('/login');
  const id = Number(fd.get('id') || 0);
  const nid = Number(fd.get('noticia_id') || 0);
  const sql = await db();
  let apagados;
  if (u.perfil === 'adm') {
    apagados = await sql`DELETE FROM comentarios WHERE id = ${id} RETURNING id`;
  } else {
    // user só apaga os próprios
    apagados = await sql`DELETE FROM comentarios WHERE id = ${id} AND usuario_id = ${u.id} RETURNING id`;
  }
  if (apagados.length) await registrar('Comentário excluído', `#${id} na notícia #${nid}`, u);
  redirect(`/noticia/${nid}`);
}
