import { NextRequest } from 'next/server';
import { unstable_noStore as noStore } from 'next/cache';
import { getClient } from '@/app/lib/db-helpers';

export async function GET(request: NextRequest) {
  noStore();
  const searchParams = request.nextUrl.searchParams;
  const podficId = searchParams.get('podfic_id');
  const chapterId = searchParams.get('chapter_id');

  const client = await getClient();
  if (chapterId && chapterId !== 'null') {
    // const result = await client.query(`
    //   select * from file where file.chapter_id = ${chapterId}
    // `);
    const result = await client.query(`
      select * from chapter where chapter_id = ${chapterId}
    `);
    return Response.json(result.rows[0]);
  }
  if (podficId && podficId !== 'null') {
    const result = await client.query(`
    select * from chapter where podfic_id = ${podficId} order by chapter_number asc;
  `);
    return Response.json(result.rows);
  }
  // TODO: some method of sorting?
  const result = await client.query(`select * from chapter`);
  return Response.json(result.rows);
}
