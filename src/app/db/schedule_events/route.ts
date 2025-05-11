import { getClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const min_date = searchParams.get('min_date');
  const max_date = searchParams.get('max_date');
  const client = await getClient();

  let queryString = `
   select schedule_event_id,schedule_event.podfic_id,schedule_event.chapter_id,schedule_event.part_id,schedule_event.round_id,
       start,"end",allday,schedule_event.type,
       work.title,work.wordcount as wordcount,
       number as round_number,
       chapter_number, chapter_title, chapter.wordcount as chapter_wordcount, chapter.status as chapter_status,
       part.part,part.words as part_wordcount,part.status as part_status
    from schedule_event
        left join podfic on schedule_event.podfic_id = podfic.podfic_id left join work on podfic.work_id = work.work_id
        left join round on schedule_event.round_id = round.round_id
        left join chapter on schedule_event.chapter_id = chapter.chapter_id
        left join part on schedule_event.part_id = part.part_id
    where (podfic.status is null or (podfic.status != 'Finished' and podfic.status != 'Posted')) and (part.status is null or (part.status != 'Submitted')) and (chapter.status is null or chapter.status != 'Posted'); 
  `;
  // TODO: more thorough stuff here
  if (min_date) {
    queryString += ` where start >= '${min_date}'`;
  }
  if (max_date) {
    queryString += ` and start <= '${max_date}'`;
  }
  // TODO: have the limiting to unfinished things be a query param

  const result = await client.query(queryString);
  return NextResponse.json(
    result.rows?.map((row) => ({ ...row, allDay: row.allday })) ?? []
  );
}
