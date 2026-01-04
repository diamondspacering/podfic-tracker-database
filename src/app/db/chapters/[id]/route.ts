import { getDBClient } from '@/app/lib/db-helpers';
import { SectionType } from '@/app/types';
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const getNotes = async (client: Pool, sectionId: number) => {
  return await client.query('select * from note where section_id = $1', [
    sectionId,
  ]);
};

const getResources = async (client: Pool, sectionId: number) => {
  return await client.query(
    'select * from resource inner join resource_section on resource.resource_id = resource_section.resource_id where resource_section.section_id = $1',
    [sectionId]
  );
};

export async function GET(
  request: NextRequest,
  context: { params: { id: any } }
) {
  const podficId = context.params.id;
  const searchParams = request.nextUrl.searchParams;
  const sectionType = searchParams.get('section_type') as SectionType;
  const client = await getDBClient();

  let result = null;
  let chapters = [];

  switch (sectionType) {
    case SectionType.DEFAULT:
      result = await client.query(
        `select * from chapter
          inner join chapter_section on chapter_section.chapter_id = chapter.chapter_id
          inner join section on chapter_section.section_id = section.section_id
        where section.podfic_id = $1
        order by chapter_number asc`,
        [podficId]
      );

      chapters = result.rows;
      for (const chapter of chapters) {
        const noteResult = await getNotes(client, chapter.section_id);
        chapter.notes = noteResult.rows ?? [];

        const resourceResult = await getResources(client, chapter.section_id);
        chapter.resources = resourceResult.rows ?? [];
      }
      return NextResponse.json(chapters ?? []);
    case SectionType.CHAPTERS_SPLIT:
      result = await client.query(
        `select * from chapter
        where chapter.podfic_id = $1
        order by chapter_number asc`,
        [podficId]
      );

      chapters = result.rows;
      // im so sorry this is highly inefficient
      for (const chapter of chapters) {
        const sectionResult = await client.query(
          `select * from section
            inner join chapter_section on chapter_section.section_id = section.section_id
          where chapter_section.chapter_id = $1 and section.podfic_id = $2 order by section.number asc`,
          [chapter.chapter_id, podficId]
        );

        const sections = sectionResult.rows ?? [];
        for (const section of sections) {
          const noteResult = await getNotes(client, section.section_id);
          section.notes = noteResult.rows ?? [];

          const resourceResult = await getResources(client, section.section_id);
          section.resources = resourceResult.rows ?? [];
        }
        chapter.sections = sections;
      }

      return NextResponse.json(chapters ?? []);
    // TODO: chapters_combine - I don't use this much so I can put in support later
    default:
      return NextResponse.json([]);
  }
}
