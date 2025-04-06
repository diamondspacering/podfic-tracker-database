import { getClient } from '@/app/lib/db-helpers';
import { createUpdateChapter } from '@/app/lib/updaters';
import { NextResponse } from 'next/server';

export async function GET(_, context: { params: { id: any } }) {
  const podficId = context.params.id;
  const client = await getClient();
  const result = await client.query(
    'select * from chapter where podfic_id = $1 order by chapter_number asc',
    [podficId]
  );

  const chapters = result.rows;

  for (const chapter of chapters) {
    const noteResult = await client.query(
      'select * from note where chapter_id = $1',
      [chapter.chapter_id]
    );
    chapter.notes = noteResult.rows ?? [];

    const resourceResult = await client.query(
      `select * from resource inner join resource_chapter on resource.resource_id = resource_chapter.resource_id where resource_chapter.chapter_id = $1`,
      [chapter.chapter_id]
    );
    chapter.resources = resourceResult.rows ?? [];
  }

  return NextResponse.json(chapters ?? []);
}

export async function PUT(request) {
  const data = await request.json();
  // const client = await getClient();
  // console.log({ data });
  // const result = await client.query(
  //   'insert into chapter (podfic_id, chapter_number, title, length) values ($1, $2, $3, $4) returning *',
  //   [data.podfic_id, data.chapter_number, data.title, data.length]
  // );
  const chapter = await createUpdateChapter(data);
  // console.log({ chapter });

  // const chapter = result.rows[0];
  return NextResponse.json(chapter);
}
