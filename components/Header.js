
import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { CATEGORIAS } from '@/lib/util';
import { sair } from '@/app/actions';

export default async function Header() {
  const u = await getUser();

  return (
    <>
      <nav>
        <Link className="logo" href="/">
          🎬 The Movie <span>Games</span>
        </Link>

        <form className="busca" action="/noticias" method="get">
          <input name="q" placeholder="Buscar notícias..." />
          <button>Buscar</button>
        </form>

        <div>
          {u?.perfil === 'adm' && (
            <>
              <Link href="/painel">Painel</Link>
              <Link href="/usuarios">Usuários</Link>
              <Link href="/auditoria">Auditoria</Link>
            </>
          )}

          {u ? (
            <>
              <Link href="/conta">Minha conta</Link>
              <form action={sair} style={{ display: 'inline' }}>
                <button className="linkbtn navbtn">
                  Sair ({u.nome}
                  {u.perfil === 'adm' ? ' • adm' : ''})
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login">Entrar</Link>
              <Link href="/register">Cadastrar</Link>
            </>
          )}
        </div>
      </nav>

      <div className="cats">
        <Link href="/">Início</Link>
        <Link href="/noticias">Todas</Link>

        {CATEGORIAS.map((c) => (
          <Link key={c} href={`/noticias?cat=${encodeURIComponent(c)}`}>
            {c}
          </Link>
        ))}
      </div>
    </>
  );
}
