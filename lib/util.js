export const CATEGORIAS = ['Games', 'Filmes', 'Séries', 'Curiosidades'];
export const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function dataBR(d) {
  return new Date(d).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function resumo(texto, n = 140) {
  const s = String(texto ?? '').replace(/\s+/g, ' ').trim();
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s;
}

// endereço da foto de uma notícia (o ?v= força atualizar quando a foto muda)
export function imgSrc(n) {
  return `/imagem/${n.id}?v=${new Date(n.atualizado_em).getTime()}`;
}
