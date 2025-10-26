import { getClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const podficId = searchParams.get('podfic_id');
  const chapterId = searchParams.get('chapter_id');
  const full = searchParams.get('full');

  const client = await getClient();

  let result = null;
  if (!!chapterId) {
    result = await client.query(
      `select * from recording_session where podfic_id = $1 and chapter_id = $2`,
      [podficId, chapterId]
    );
  } else if (full === 'true') {
    result = await client.query(
      `select * from recording_session where podfic_id = $1`,
      [podficId]
    );
  } else {
    result = await client.query(
      `select * from recording_session where podfic_id = $1 and chapter_id is null`,
      [podficId]
    );
  }

  return NextResponse.json(result.rows ?? []);
}
