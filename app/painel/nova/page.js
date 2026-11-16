import { exigeAdm } from '@/lib/auth';
import NoticiaForm from '@/components/NoticiaForm';

export default async function Nova({ searchParams }) {
  await exigeAdm();
  const sp = await searchParams;
  return (
    <>
      <h2>Nova notícia</h2>
      <NoticiaForm erro={sp.erro} />
    </>
  );
}
