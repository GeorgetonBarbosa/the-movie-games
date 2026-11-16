import './globals.css';
import Header from '@/components/Header';

export const metadata = {
  title: 'The Movie Games',
  description: 'Notícias de games e cinema',
};

export const dynamic = 'force-dynamic';

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main>{children}</main>
        <footer>© The Movie Games — notícias de jogos e cinema</footer>
      </body>
    </html>
  );
}
