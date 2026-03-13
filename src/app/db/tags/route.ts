import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

// This is necessary for allowing both GET and PUT in the same route
// per https://github.com/vercel/next.js/discussions/69331
export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await getDBClient();

  const result = await client.query('select * from tag');

  return NextResponse.json(result.rows ?? []);
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  const client = await getDBClient();
  const result = await client.query(
    'insert into tag (tag) values ($1) returning *',
    [data.tag],
  );

  return NextResponse.json(result.rows[0]);
}
