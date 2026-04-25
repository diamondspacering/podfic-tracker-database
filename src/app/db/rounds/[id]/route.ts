import { getDBClient } from '@/app/lib/db-helpers';
import { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: { id: any } },
) {
  const id = context.params.id;

  const client = await getDBClient();

  const result = await client.query('SELECT * FROM round WHERE round_id = $1', [
    id,
  ]);

  return result.rows.length ? result.rows[0] : null;
}
