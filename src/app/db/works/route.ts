import { getClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  const client = await getClient();

  const result = await client.query(
    'select *,name as fandom_name from work left join fandom on work.fandom_id = fandom.fandom_id order by title asc'
  );

  return NextResponse.json(result.rows);
}
