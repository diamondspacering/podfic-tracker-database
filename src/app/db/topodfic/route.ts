import { getDBClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getDBClient();

  const result = await client.query(`
    select * from
    (select *,fandom.name as fandom_name,event.name as event_name,event_parent.name as parent_name, (select to_json(array_agg(row_to_json(t)))
      from (select tag.tag_id, tag from tag inner join tag_podfic on tag.tag_id = tag_podfic.tag_id where tag_podfic.podfic_id = podfic.podfic_id) t) as tags
    from podfic
            inner join work on podfic.work_id = work.work_id
            left join author on work.author_id = author.author_id
            left join fandom on work.fandom_id = fandom.fandom_id
            left join event on podfic.event_id = event.event_id
            left join event_parent on event.parent_id = event_parent.event_parent_id) as tagged_podfic
    where tagged_podfic.status != 'Posted' and tagged_podfic.status != 'Finished' and tagged_podfic.status != 'Posting'
    order by added_date asc;
  `);
  // consider making this just permission notes?
  const authorNoteResult = await client.query(
    'select * from note where author_id is not null'
  );
  const authorNotes = authorNoteResult.rows;
  // TODO: consider podfic notes as well, and separate them from author notes?

  let podfics = result.rows;

  podfics = podfics.map((podfic) => ({
    ...podfic,
    notes: authorNotes.filter((note) => note.author_id === podfic.author_id),
  }));

  return NextResponse.json(podfics);
}
