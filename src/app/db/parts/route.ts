import { getClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClient();

  const result = await client.query(
    `select part.part_id,part.podfic_id,part.chapter_id,doc,audio_link,username,part,part.words as words,part.type as type,part.length as length,part.raw_length as raw_length,part.status as status,work.title as title,event.name as event_name from part
      left join podficcer on podficcer.podficcer_id = part.organizer
      left join podfic on podfic.podfic_id = part.podfic_id
      left join chapter on chapter.chapter_id = part.chapter_id
      left join work on podfic.work_id = work.work_id
      left join event on event.event_id = podfic.event_id
    order by part.created_at`
  );

  // console.log('parts', result.rows);

  return NextResponse.json(result.rows ?? []);
}
