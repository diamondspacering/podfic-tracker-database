import { fetchPodfic } from '@/app/lib/loaders';
import ChapterTable from './ChapterTable';
import { Metadata } from 'next';
import { cache } from 'react';

const getPodfic = cache(async (id: string) => {
  return await fetchPodfic(id);
});

export async function generateMetadata({ params }): Promise<Metadata> {
  const { id } = await params;

  const { title } = await getPodfic(id);

  return {
    title: `${title ?? 'Podfic'} Chapters`,
  };
}

export default async function Page({ params }) {
  const { id } = await params;
  const podfic = await getPodfic(id);

  return (
    <ChapterTable
      podficId={id}
      podficTitle={podfic.title}
      sectionType={podfic.section_type}
    />
  );
}
