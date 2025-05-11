import { getClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  const client = await getClient();
  const fileResult = await client.query(
    'select * from file where file.file_id = $1',
    [id]
  );
  const file = fileResult.rows[0] as File;
  const fileLinkResult = await client.query(
    'select * from file_link where file_id = $1',
    [id]
  );
  file.links = fileLinkResult.rows as FileLink[];
  return NextResponse.json(file ?? {});
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  const client = await getClient();

  const links = await client.query(
    `select * from file_link where file_id = $1`,
    [id]
  );
  // ?? that seems like an incorrect way to do it. surely you only need to delete once
  for (const link of links.rows) {
    await client.query(`DELETE FROM file_link WHERE file_id = $1`, [id]);
  }
  const result = await client.query(`DELETE FROM file WHERE file_id = $1`, [
    id,
  ]);
  console.log('deleted file');

  return NextResponse.json(result);
}
