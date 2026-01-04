import { getDBClient } from '@/app/lib/db-helpers';
import { unstable_noStore as noStore } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  noStore();
  const client = await getDBClient();
  const searchParams = request.nextUrl.searchParams;
  const resourceType = searchParams.get('resource_type');
  const podficId = searchParams.get('podfic_id');
  // const isFull = searchParams.get('full');
  // console.log({ isFull });
  const sectionId = searchParams.get('section_id');
  // TODO: author
  const eventId = searchParams.get('event_id');

  let resourceResult = null;
  if (!!resourceType) {
    let result = null;
    if (resourceType === 'null') {
      result = await client.query(`select * from resource`);
    } else {
      result = await client.query(
        `select * from resource where resource_type = $1`,
        [resourceType]
      );
    }
    resourceResult = result.rows ?? [];
  } else if (!!sectionId) {
    const sectionResult = await client.query(
      `select * from resource inner join resource_section on resource.resource_id = resource_section.resource_id where resource_section.section_id = $1`,
      [sectionId]
    );
    resourceResult = sectionResult.rows ?? [];
  } else if (!!podficId) {
    const podficResult = await client.query(
      `select * from resource inner join resource_podfic on resource.resource_id = resource_podfic.resource_id where resource_podfic.podfic_id = $1`,
      [podficId]
    );
    resourceResult = podficResult.rows ?? [];
    // hmm sorting by chap would be nice but then the podfic id on there would be pointless bc we'd be fetching chapter anyway. much to think on.....
    // if (isFull) {
    //   const chapterResult = await client.query(
    //     `select * from resource inner join resource_chapter on resource.resource_id = resource_chapter.resource_id where resource_chapter.podfic_id = $1`, [podficId]
    //   );
    //   resourceResult = [...resourceResult, ...(chapterResult.rows ?? [])];
    // }
  } else if (!!eventId) {
    const eventResult = await client.query(
      `select * from resource inner join resource_event on resource.resource_id = resource_event.resource_id where resource_event.event_id = $1`,
      [eventId]
    );
    resourceResult = eventResult.rows ?? [];
  }
  // TODO: author id

  return NextResponse.json(resourceResult ?? []);
}
