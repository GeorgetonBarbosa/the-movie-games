
import Link from 'next/link';
import { dataBR, resumo, imgSrc } from '@/lib/util';

export default function ItemNoticia({ n }) {
  return (
    <Link className="item" href={`/noticia/${n.id}`}>
      {n.tem_imagem ? (
        <img src={imgSrc(n)} alt="" />
      ) : (
        <div className="semimg" />
      )}

      <div className="item-txt">
        <span className="tag">{n.categoria}</span>
        <h3>{n.titulo}</h3>
        <p>{resumo(n.conteudo)}</p>

        <small>
          por {n.autor} • {dataBR(n.criado_em)}
        </small>
      </div>
    </Link>
  );
}
