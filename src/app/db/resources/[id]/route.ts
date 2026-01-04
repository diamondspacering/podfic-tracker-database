import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  const client = await getDBClient();
  const result = await client.query(
    `select * from resource where resource_id = ${id}`
  );

  const resource = result.rows[0];

  return NextResponse.json(resource ?? {});
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  const client = await getDBClient();
  const result = await client.query(
    `DELETE FROM resource WHERE resource_id = ${id}`
  );

  return NextResponse.json(result);
}
