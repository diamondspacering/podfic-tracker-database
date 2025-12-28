import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/app/lib/db-helpers';

export async function GET(
  request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;
  if (id === 'new') {
    return NextResponse.json({});
  }

  const searchParams = request.nextUrl.searchParams;
  const withCoverArt = searchParams.get('with_cover_art');
  const withAuthor = searchParams.get('with_author');
  const withPodficcers = searchParams.get('with_podficcers');
  const withTags = searchParams.get('with_tags');
  const withSectionChapters = searchParams.get('with_section_chapters');

  const client = await getClient();

  let podfic = null;
  if (withCoverArt && withAuthor) {
    // TODO: this is returning some weird results (no podfic id????)
    const result = await client.query(
      `select *,cover_art.status as cover_art_status from podfic
        inner join work on podfic.work_id = work.work_id
        left join cover_art on cover_art.podfic_id = podfic.podfic_id
        left join author on work.author_id = author.author_id
      where podfic.podfic_id = $1`,
      [id]
    );
    podfic = result.rows[0];
    const coverArtResult = await client.query(
      `select *,status as cover_art_status from cover_art where podfic_id = $1`,
      [id]
    );
    podfic.coverArt = coverArtResult.rows[0];
    const noteResult = await client.query(
      `select * from note where podfic_id = $1`,
      [id]
    );
    podfic.notes = noteResult.rows ?? [];
  } else {
    const result = await client.query(
      `select * from podfic inner join work on podfic.work_id = work.work_id where podfic_id = ${id}`
    );
    podfic = result.rows[0];
  }

  if (withPodficcers) {
    const podficcerResult = await client.query(
      `
      select * from podficcer
        inner join podfic_podficcer on podfic_podficcer.podficcer_id = podficcer.podficcer_id
      where podfic_id = $1
    `,
      [id]
    );
    podfic.podficcers = podficcerResult.rows ?? [];
  }

  if (withTags) {
    const tagResult = await client.query(
      `select * from tag inner join tag_podfic on tag_podfic.tag_id = tag.tag_id where podfic_id = $1`,
      [id]
    );
    podfic.tags = tagResult.rows ?? [];
  }

  // TODO: does this need sections,
  const chapterResult = await client.query(
    `select * from chapter where chapter.podfic_id = ${id} order by chapter_number asc`
  );
  const sectionResult = await client.query(
    `select * from section where section.podfic_id = ${id} order by number asc`
  );
  if (podfic) {
    podfic.chapters = chapterResult.rows;
    podfic.sections = sectionResult.rows;
  }

  if (withSectionChapters) {
    for (const section of podfic.sections) {
      const sectionChapterResult = await client.query(
        `select * from chapter inner join chapter_section on chapter.chapter_id = chapter_section.chapter_id where section_id = $1 order by chapter_number asc limit 1`,
        [section.section_id]
      );
      section.chapters = sectionChapterResult.rows;
    }
  }

  return NextResponse.json(podfic ?? {});
}
