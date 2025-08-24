import { readFileSync } from 'fs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // let tagMappings = readFileSync('./src/scripts/tag_mappings.json', 'utf-8');
  // tagMappings = JSON.parse(tagMappings);
  const tagMappings = null;

  return NextResponse.json(
    tagMappings ?? {
      fandom_mapping: {},
      relationship_mapping: {},
      character_mapping: {},
    }
  );
}

export async function PATCH(request: NextRequest) {
  const newTagMappings = await request.json();
  console.log({ newTagMappings });

  return NextResponse.json({});
}
