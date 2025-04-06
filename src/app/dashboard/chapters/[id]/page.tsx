import { fetchPodfic } from '@/app/lib/loaders';
import ChapterTable from './ChapterTable';

export default async function Page({ params }: { params: { id: any } }) {
  const podfic = await fetchPodfic(params.id);

  return <ChapterTable podficId={params.id} podficTitle={podfic.title} />;
}
