import { fetchDWMetadata } from '@/app/lib/ao3Loaders';
import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sectionId = searchParams.get('section_id');

  const client = await getDBClient();

  const result = await client.query(
    `select work.link as work_link from section inner join podfic on section.podfic_id = podfic.podfic_id inner join work on podfic.work_id = work.work_id where section_id = $1`,
    [sectionId],
  );

  const metadata = await fetchDWMetadata(result.rows[0].work_link);

  return NextResponse.json(metadata);
}
