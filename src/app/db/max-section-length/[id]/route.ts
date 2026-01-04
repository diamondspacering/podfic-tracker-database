import { getDBClient } from '@/app/lib/db-helpers';
import { getDefaultLength } from '@/app/types';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: { id: any } }
) {
  const client = await getDBClient();
  const podficId = context.params.id;

  const lengthResult = await client.query(
    `
    SELECT length FROM section
    WHERE podfic_id = $1 AND length is not null
    ORDER BY length DESC
    LIMIT 1
  `,
    [podficId]
  );
  let length = getDefaultLength();
  if (lengthResult.rows?.length) {
    length = lengthResult.rows[0]?.length;
  }

  const rawLength = getDefaultLength();
  // not being used right now
  // const rawLengthResult = await client.query(
  //   `SELECT raw_length FROM section
  // WHERE podfic_id = $1 AND raw_length is not null
  // ORDER BY raw_length DESC
  // LIMIT 1`
  // );
  // if (rawLengthResult.rows?.length) {
  //   rawLength = rawLengthResult.rows[0]?.length;
  // }

  return NextResponse.json({ length, rawLength });
}
