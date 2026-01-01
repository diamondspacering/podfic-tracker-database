import { fetchPodfic } from '@/app/lib/loaders';
import ChapterTable from './ChapterTable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podfic Chapters',
};

export default async function Page({ params }: { params: { id: any } }) {
  const podfic = await fetchPodfic(params.id);

  return (
    <ChapterTable
      podficId={params.id}
      podficTitle={podfic.title}
      sectionType={podfic.section_type}
    />
  );
}
