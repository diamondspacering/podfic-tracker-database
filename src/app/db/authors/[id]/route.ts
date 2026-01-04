import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;
  if (id === 'new' || id === 'null') {
    return Response.json({});
  }

  const client = await getDBClient();

  const result = await client.query(
    `select * from author where author_id = $1`,
    [id]
  );
  const author = result.rows[0];

  return NextResponse.json(author ?? {});
}
