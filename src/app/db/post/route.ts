import { getClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';
import { IS_REACT_LEGACY } from 'swr/_internal';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  // TODO: better chapter support?
  const podficId = searchParams.get('podfic_id');
  const chapterId = searchParams.get('chapter_id');

  // ok so we need length, html string, skin? let's just default it to Azdaema for now ok, yeah there should be like html config or smth oh for podfic as a whole,,,,
  const client = await getClient();

  if (chapterId !== 'null') {
    const chapter = (
      await client.query(
        `select chapter_number,chapter_title,length,html_string from chapter where chapter_id = $1 and podfic_id = $2`,
        [chapterId, podficId]
      )
    ).rows[0];

    const podfic = (
      await client.query(
        `select wordcount,is_multivoice from podfic inner join work on podfic.work_id = work.work_id where podfic.podfic_id = $1`,
        [podficId]
      )
    ).rows[0];

    const estimatedLength = Math.round(
      (typeof podfic.wordcount === 'string'
        ? parseInt(podfic.wordcount)
        : podfic.wordcount) /
        130 /
        60
    );

    return NextResponse.json({
      chapter_number: chapter.chapter_number,
      chapter_title: chapter.chapter_title,
      length: chapter.length,
      est_length: estimatedLength,
      html_string: chapter.html_string,
      is_multivoice: podfic.is_multivoice,
    });
  } else {
    const podfic = (
      await client.query(
        `select length,html_string,is_multivoice from podfic where podfic_id = $1`,
        [podficId]
      )
    ).rows[0];

    return NextResponse.json({
      length: podfic.length,
      html_string: podfic.html_string,
      is_multivoice: podfic.is_multivoice,
    });
  }
}
