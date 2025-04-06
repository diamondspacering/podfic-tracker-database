import { getClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClient();

  const result = await client.query(`select * from series`);

  return NextResponse.json(result.rows ?? []);
}
