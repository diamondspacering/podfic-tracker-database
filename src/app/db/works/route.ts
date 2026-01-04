import { getDBClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  const client = await getDBClient();

  const result = await client.query(
    'select *,name as fandom_name from work left join fandom on work.fandom_id = fandom.fandom_id order by title asc'
  );

  return NextResponse.json(result.rows);
}
