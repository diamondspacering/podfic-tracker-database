import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: { podficId: any } },
) {
  const podficId = context.params.podficId;

  const client = await getDBClient();

  const result = await client.query(
    'select * from recording_preset where podfic_id = $1',
    [podficId],
  );

  return NextResponse.json(result.rows.length === 0 ? [] : result.rows[0]);
}
