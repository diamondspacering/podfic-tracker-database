import { getDBClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getDBClient();

  const result = await client.query('select * from podficcer');
  return NextResponse.json(result.rows ?? []);
}
