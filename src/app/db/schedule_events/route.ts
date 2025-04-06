import { getClient } from '@/app/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET() {
  const client = await getClient();

  const result = await client.query(`select * from schedule_event`);
  return NextResponse.json(
    result.rows?.map((row) => ({ ...row, allDay: row.allday })) ?? []
  );
}
