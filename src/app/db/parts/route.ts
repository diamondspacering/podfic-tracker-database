import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const podficId = searchParams.get('podfic_id');

  const client = await getDBClient();
  let result = null;

  if (podficId) {
    result = await client.query(`select * from part where podfic_id = $1`, [
      podficId,
    ]);
  } else {
    result = await client.query(
      `select
        part.part_id,part.podfic_id,section.section_id,part.chapter_id,section.text_link,part.audio_link,username,part,section.wordcount,part.type as type,section.length as length,section.raw_length as raw_length,part.status as status,work.title as title,
        (select to_json(array_agg(row_to_json(e))) from
          (select event.name as event_name,event_parent.name as parent_name,year from event
            left join event_parent on event.parent_id = event_parent.event_parent_id
            inner join podfic_event on event.event_id = podfic_event.event_id
          where podfic_event.podfic_id = podfic.podfic_id)
        e) as events
      from part
      left join section on section.part_id = part.part_id
      left join podfic on podfic.podfic_id = part.podfic_id
      left join podficcer on podficcer.podficcer_id = part.organizer
      left join work on podfic.work_id = work.work_id
    order by part.created_at`,
    );
  }

  return NextResponse.json(result.rows ?? []);
}
