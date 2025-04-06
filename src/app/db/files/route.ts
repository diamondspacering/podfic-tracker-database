import { getClient } from '@/app/lib/db-helpers';
import { unstable_noStore as noStore } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  noStore();
  const client = await getClient();
  const searchParams = request.nextUrl.searchParams;
  const podficId = searchParams.get('podfic_id');
  const chapterId = searchParams.get('chapter_id');
  const withChapters = searchParams.get('with_chapters');

  let fileResult = {} as any;

  if (chapterId && chapterId !== 'null') {
    fileResult = await client.query(`
      select * from file where file.chapter_id = ${chapterId}
    `);
  } else {
    if (withChapters && withChapters === 'true') {
      fileResult = await client.query(
        'select * from file where file.podfic_id = $1',
        [podficId]
      );
    } else {
      fileResult = await client.query(`
        select * from file where file.podfic_id = ${podficId} and file.chapter_id is null
      `);
    }
  }

  const files = fileResult.rows as File[];
  for (const file of files) {
    const fileLinkResult = await client.query(`
        select * from file_link where file_id = ${file.file_id}
      `);
    file.links = fileLinkResult.rows as FileLink[];
  }

  return NextResponse.json(files ?? []);
}
