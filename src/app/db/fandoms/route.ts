import { NextResponse } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getClient } from '@/app/lib/db-helpers';

export async function GET() {
  noStore();
  const client = await getClient();
  const result = await client.query(`
    select fandom_id,fandom_category_id,fandom.name as fandom_name,category_id,fandom_category.name as category_name from fandom inner join fandom_category on fandom.category_id = fandom_category.fandom_category_id order by fandom_category.name,fandom.name asc;
  `);

  return NextResponse.json(result.rows);
}
