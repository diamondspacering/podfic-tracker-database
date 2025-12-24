import { getClient } from '@/app/lib/db-helpers';
import { unstable_noStore as noStore } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  noStore();
  const client = await getClient();
  const searchParams = request.nextUrl.searchParams;
  const podficId = searchParams.get('podfic_id');
  const sectionId = searchParams.get('section_id');
  const chapterId = searchParams.get('chapter_id');
  const withChapters = searchParams.get('with_chapters');
  const onlyNonAAFiles = searchParams.get('only_non_aa_files');

  let fileResult = {} as any;

  if (sectionId && sectionId !== 'null') {
    fileResult = await client.query(`
      select * from file where file.section_id = ${sectionId}
    `);
  } else {
    if (withChapters && withChapters === 'true') {
      if (onlyNonAAFiles && onlyNonAAFiles === 'true') {
        fileResult = await client.query(
          `select file.file_id,podfic_id,chapter_id,length,size,filetype,label,is_plain from file
          left join file_link on file_link.file_id = file.file_id
          where file.podfic_id = $1
          group by file.file_id
          having string_agg(host, ',') not like '%audiofic archive%'
        `,
          [podficId]
        );
      } else
        fileResult = await client.query(
          'select * from file where file.podfic_id = $1',
          [podficId]
        );
    } else {
      // TODO: oh no we need a better way to indicate what's a summary/general podfic file vs a section/chapter file
      fileResult = await client.query(`
        select * from file where file.podfic_id = ${podficId} and file.section_id is null
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
