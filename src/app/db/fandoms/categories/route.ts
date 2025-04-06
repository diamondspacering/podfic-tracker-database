import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getClient } from '@/app/lib/db-helpers';

export async function GET() {
  noStore();
  const client = await getClient();
  const result = await client.query(`
    select fandom_category_id,name as category_name from fandom_category order by name asc;
  `);

  return NextResponse.json(result.rows ?? []);
}
