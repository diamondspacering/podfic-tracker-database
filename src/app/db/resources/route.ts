import { getClient } from '@/app/lib/db-helpers';
import { unstable_noStore as noStore } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  noStore();
  const client = await getClient();
  const searchParams = request.nextUrl.searchParams;
  const resourceType = searchParams.get('resource_type');
  const podficId = searchParams.get('podfic_id');
  const isFull = searchParams.get('full');
  // console.log({ isFull });
  const chapterId = searchParams.get('chapter_id');
  // TODO: author & event

  let resourceResult = null;
  if (!!resourceType) {
    // console.log('fetching resources by type');
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
  } else if (!!chapterId) {
    // console.log('fetching resources for chapter');
    const chapterResult = await client.query(
      `select * from resource inner join resource_chapter on resource.resource_id = resource_chapter.resource_id where resource_chapter.chapter_id = $1`,
      [chapterId]
    );
    resourceResult = chapterResult.rows ?? [];
  } else if (!!podficId) {
    // console.log('fetching resources for podfic');
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
  }
  // TODO: author & event ids

  return NextResponse.json(resourceResult ?? []);
}
