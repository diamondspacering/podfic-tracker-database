import { getClient } from '@/app/lib/db-helpers';
import { fetchPodficsFull, fetchPodficsWithChapters } from '@/app/lib/loaders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('event_id');
  const missingAALinks = searchParams.get('missing_aa_links') === 'true';
  let podfics = null;
  console.log({ missingAALinks });
  if (eventId) {
    const client = await getClient();
    const result = await client.query(
      `select * from podfic
        inner join work on podfic.work_id = work.work_id
        left join author on work.author_id = author.author_id
      where event_id = $1 order by added_date`,
      [eventId]
    );
    // console.log(result.rows);
    podfics = result.rows;

    for (const podfic of podfics) {
      const noteResult = await client.query(
        `select * from note where podfic_id = $1`,
        [podfic.podfic_id]
      );
      podfic.notes = noteResult.rows ?? [];

      // TODO: don't get chapter resources
      // const resourceResult = await client.query(
      //   `select * from resource inner join resource_podfic on resource.resource_id = resource_podfic.resource_id where resource_podfic.podfic_id = $1`,
      //   [podfic.podfic_id]
      // );
      // podfic.resources = resourceResult.rows ?? [];
    }
  } else {
    podfics = await fetchPodficsFull(missingAALinks);
    // console.log(podfics);
  }

  return NextResponse.json(podfics ?? []);
}
