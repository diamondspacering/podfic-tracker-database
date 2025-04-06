import { getClient } from '@/app/lib/db-helpers';
import { unstable_noStore as noStore } from 'next/cache';
import { NextResponse } from 'next/server';

// have like a ?full=true?
export async function GET() {
  noStore();
  const client = await getClient();
  const result = await client.query(`
    select * from author order by username asc
  `);
  const authors = (result.rows ?? []) as Author[];
  for (const author of authors) {
    const resourceResult = await client.query(
      `select * from resource
        inner join resource_author on resource.resource_id = resource_author.resource_id
        where resource_author.author_id = $1`,
      [author.author_id]
    );
    author.resources = (resourceResult.rows ?? []) as Resource[];

    const noteResult = await client.query(
      `select * from note where author_id = $1`,
      [author.author_id]
    );
    author.notes = (noteResult.rows ?? []) as Note[];
  }

  return NextResponse.json(result.rows ?? []);
}
