import { fetchChapterMetadata } from '@/app/lib/ao3Loaders';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('get chapter metadata');
  const searchParams = request.nextUrl.searchParams;
  const workUrl = searchParams.get('work_url');
  if (!workUrl) return NextResponse.json({});
  const chapterMetadata = await fetchChapterMetadata(workUrl);

  return NextResponse.json(chapterMetadata ?? {});
}
