import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const partId = searchParams.get('part_id');

  let sections = null;
  const client = await getDBClient();
  if (partId && partId !== 'null') {
    const result = await client.query(
      `select * from section where part_id = $1 limit 1`,
      [partId]
    );
    sections = result.rows;

    if (sections.length) {
      return NextResponse.json(sections[0]);
    } else {
      return NextResponse.json({});
    }
  }

  return NextResponse.json({});
}
