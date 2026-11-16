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
        <footer>
          <a href="https://www.instagram.com/themoviegames_/" target="_blank">Instagram</a> • <a href="https://www.youtube.com/@comodogamestv" target="_blank">YouTube</a>
          <br />© The Movie Games — notícias de jogos e cinema
        </footer>
      </body>
    </html>
  );
}
