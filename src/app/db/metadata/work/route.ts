import { fetchWorkMetadata } from '@/app/lib/ao3Loaders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('get work metadata');
  const searchParams = request.nextUrl.searchParams;
  const workUrl = searchParams.get('work_url');
  if (!workUrl) return NextResponse.json({});
  const metadata = await fetchWorkMetadata(workUrl ?? '');
  console.log({ metadata });

  return NextResponse.json(metadata ?? {});
}
