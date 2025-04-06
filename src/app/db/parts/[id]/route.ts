import { getClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  if (id === 'null') {
    return NextResponse.json({});
  }

  const client = await getClient();

  const result = await client.query(
    `select * from part left join podficcer on podficcer.podficcer_id = part.organizer where part_id = $1`,
    [id]
  );

  return NextResponse.json(result.rows[0]);
}
