import { getDBClient } from '@/app/lib/db-helpers';
import { unstable_noStore as noStore } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  noStore();
  const searchParams = request.nextUrl.searchParams;
  const parentsOnly = searchParams.get('parents_only');
  const childrenFirst = searchParams.get('children_first');

  const client = await getDBClient();
  if (childrenFirst !== 'true') {
    const eventParentResult = await client.query(`
    select * from event_parent order by name asc;
  `);
    const eventParents = eventParentResult.rows as EventParent[];
    if (parentsOnly !== 'true')
      for (const eventParent of eventParents) {
        const eventResult = await client.query(
          `
      select * from event where parent_id = $1 order by year
    `,
          [eventParent.event_parent_id],
        );
        const events = eventResult.rows as Event[];
        eventParent.events = events;
      }

    return NextResponse.json(eventParents ?? []);
  } else {
    const eventsResult = await client.query(
      `select
        *,
        event_parent.name as parent_name,
        event.name as event_name
      from event
        inner join event_parent on parent_id = event_parent_id
      order by event.name,year asc;`,
    );
    return NextResponse.json(
      eventsResult.rows?.map((event) => ({
        ...event,
        name: event.event_name,
      })) ?? [],
    );
  }
}
