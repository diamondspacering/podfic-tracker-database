import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: any } }
) {
  const sectionId = context.params.id;

  const client = await getDBClient();

  const result = await client.query(
    'select * from section where section_id = $1',
    [sectionId]
  );
  const chapterResult = await client.query(
    `select * from chapter
      inner join chapter_section on chapter.chapter_id = chapter_section.chapter_id
    where section_id = $1
    order by chapter_number asc
    limit 1
    `,
    [sectionId]
  );
  const section = result.rows[0];
  section.chapters = chapterResult.rows;

  return NextResponse.json(section);
}
