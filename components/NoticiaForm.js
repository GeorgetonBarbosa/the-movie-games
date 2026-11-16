import Link from 'next/link';
import { salvarNoticia } from '@/app/actions';
import { CATEGORIAS, imgSrc } from '@/lib/util';

export default function NoticiaForm({ noticia, erro }) {
  const editando = Boolean(noticia);
  return (
    <>
      {erro && <p className="erro">{erro}</p>}
      <form action={salvarNoticia}>
        {editando && <input type="hidden" name="id" value={noticia.id} />}
        <label>
          Título
          <input name="titulo" defaultValue={noticia?.titulo ?? ''} required />
        </label>
        <label>
          Categoria
          <select name="categoria" defaultValue={noticia?.categoria ?? 'Games'}>
            {CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Foto da notícia (JPG, PNG, WEBP ou GIF, até 2 MB)
          {editando && noticia.tem_imagem && (
            <>
              <img src={imgSrc(noticia)} alt="" style={{ maxWidth: 260, borderRadius: 6, margin: '6px 0' }} />
              <small>Para trocar a foto, escolha outra abaixo. Se não escolher, a atual é mantida.</small>
            </>
          )}
          <input type="file" name="imagem" accept="image/*" required={!editando} />
        </label>
        <label>
          Conteúdo
          <textarea name="conteudo" rows={8} defaultValue={noticia?.conteudo ?? ''} required />
        </label>
        <button className="btn">Salvar</button>
        <Link href="/painel">Cancelar</Link>
      </form>
    </>
  );
}
