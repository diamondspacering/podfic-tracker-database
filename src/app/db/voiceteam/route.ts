import { getDBClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  // const searchParams = request.nextUrl.searchParams;
  // const withRounds = searchParams.get('with_rounds') === 'true';

  const client = await getDBClient();

  const result = await client.query('select * from voiceteam_event');

  return NextResponse.json(result.rows ?? []);
}
