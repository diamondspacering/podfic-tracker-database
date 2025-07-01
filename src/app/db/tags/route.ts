import { getClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const client = await getClient();

  const result = await client.query('select * from tag');

  return NextResponse.json(result.rows ?? []);
}

export async function PUT(request: NextRequest) {
  const data = await request.json();

  const client = await getClient();
  const result = await client.query(
    'insert into tag (tag) values ($1) returning *',
    [data.tag]
  );

  return NextResponse.json(result.rows[0]);
}
