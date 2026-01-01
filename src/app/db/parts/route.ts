import { getClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClient();

  // TODO: there's prob changes here bc of sections
  const result = await client.query(
    `select part.part_id,part.podfic_id,section.section_id,part.chapter_id,section.text_link,part.audio_link,username,part,section.wordcount,part.type as type,section.length as length,section.raw_length as raw_length,part.status as status,work.title as title,event.name as event_name from part
      left join section on section.part_id = part.part_id
      left join podfic on podfic.podfic_id = part.podfic_id
      left join podficcer on podficcer.podficcer_id = part.organizer
      left join work on podfic.work_id = work.work_id
      left join event on event.event_id = podfic.event_id
    order by part.created_at`
  );

  return NextResponse.json(result.rows ?? []);
}
