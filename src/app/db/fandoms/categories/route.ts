import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getDBClient } from '@/app/lib/db-helpers';

export async function GET() {
  noStore();
  const client = await getDBClient();
  const result = await client.query(`
    select fandom_category_id,name as category_name from fandom_category order by name asc;
  `);

  return NextResponse.json(result.rows ?? []);
}
