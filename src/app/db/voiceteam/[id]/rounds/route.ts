import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

// NOTE: this is sent with a voiceteam_event_id
// I am consistent and perfect
export async function GET(
  _request: NextRequest,
  context: { params: { id: any } },
) {
  const id = context.params.id;

  const client = await getDBClient();

  const result = await client.query(
    'select * from round where voiceteam_event_id = $1 order by number',
    [id],
  );

  return NextResponse.json(result.rows ?? []);
}
