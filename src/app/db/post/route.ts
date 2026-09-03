import { fetchDWMetadata } from '@/app/lib/ao3Loaders';
import { getDBClient } from '@/app/lib/db-helpers';
import { getSectionName } from '@/app/lib/html';
import { getIsPostedChaptered } from '@/app/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  console.log({ searchParams });
  const sectionId = searchParams.get('section_id');
  console.log({ sectionId });
  const format = searchParams.get('format');

  const client = await getDBClient();

  if (format === 'dw') {
    const result = await client.query(
      `select work.title as work_title,work.link as work_link,html_string,fandom.name as fandom_name from section inner join podfic on section.podfic_id = podfic.podfic_id inner join work on podfic.work_id = work.work_id left join fandom on work.fandom_id = fandom.fandom_id where section_id = $1`,
      [sectionId],
    );

    const section = result.rows[0];
    console.log(section);

    // TODO: more section-specific stuff?

    const { warnings, summary, freeforms } = await fetchDWMetadata(
      section.work_link,
    );

    const data = {
      title: section.work_title,
      fandom_name: section.fandom_name.toLowerCase(),
      html_string: section.html_string,
      warnings,
      summary,
      freeforms,
    };

    return NextResponse.json(data);

    // return data;
  } else {
    const result = await client.query(
      `select number,section.title as section_title,section_type,chaptered,chapter_count,work.wordcount as podfic_wordcount,is_multivoice,section.length,html_string from section
      inner join podfic on section.podfic_id = podfic.podfic_id
      inner join work on podfic.work_id = work.work_id
    where section_id = $1
    `,
      [sectionId],
    );
    const section = result.rows[0];
    console.log(result.rows);

    const sectionType = section.section_type;

    const estimatedLength = Math.round(
      (typeof section.podfic_wordcount === 'string'
        ? parseInt(section.podfic_wordcount)
        : section.podfic_wordcount) /
        130 /
        60,
    );

    const chaptered = getIsPostedChaptered(sectionType, section.chaptered);

    let data: any = {
      section_type: sectionType,
      html_string: section.html_string,
      length: section.length,
      est_length: estimatedLength,
      is_multivoice: section.is_multivoice,
      number: section.number,
      title: section.title,
      chaptered,
      chapter_count: section.chapter_count,
    };

    if (chaptered) {
      const chapters = (
        await client.query(
          `select chapter_number,chapter_title from chapter inner join chapter_section on chapter_section.chapter_id = chapter.chapter_id where section_id = $1`,
          [sectionId],
        )
      ).rows;

      section.chapters = chapters;

      data = {
        ...data,
        chapters,
      };
    }

    data = {
      ...data,
      title: getSectionName({ section, sectionType }),
    };

    console.log({ data });

    return NextResponse.json(data);
  }
}
