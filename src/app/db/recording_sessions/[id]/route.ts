import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  const client = await getDBClient();

  const result = await client.query(
    `select * from recording_session where recording_id = $1`,
    [id]
  );

  return NextResponse.json(result.rows[0]);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  const client = await getDBClient();

  const result = await client.query(
    `DELETE FROM recording_session WHERE recording_id = $1`,
    [id]
  );

  return NextResponse.json(result);
}
