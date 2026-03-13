import { readFileSync, writeFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

// This is probably necessary for allowing both GET and PATCH in the same route
// per https://github.com/vercel/next.js/discussions/69331
export const dynamic = 'force-dynamic';

export async function GET() {
  let tagMappings = readFileSync('./src/scripts/tag_mappings.json', 'utf-8');
  tagMappings = JSON.parse(tagMappings);

  return NextResponse.json(
    tagMappings ?? {
      fandom_mapping: {},
      relationship_mapping: {},
      character_mapping: {},
    },
  );
}

export async function PATCH(request: NextRequest) {
  const newTagMappings = await request.json();
  writeFileSync(
    './src/scripts/tag_mappings.json',
    JSON.stringify(newTagMappings),
  );

  return NextResponse.json({});
}
