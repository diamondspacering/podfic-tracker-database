'use client';

import { Typography } from '@mui/material';
import { SectionType } from '@/app/types';
import ChapterOnlyTable from './ChapterOnlyTable';
import ChapterWithSubSectionsTable from './ChapterWithSubSectionsTable';
import {
  ChapterTableContext,
  useChapterTableContext,
} from './ChapterTableContext';

// ok so if default or multiple-to-single just show chapters
// single-to-multiple not applicable
// if chapters-split then show sections under chapter headers
// if chapters-combine then show chapters included in sections under section headers - has not been implemented yet
export default function ChapterTable({
  podficId,
  podficTitle,
  sectionType = SectionType.DEFAULT,
}) {
  const chapterTableContext = useChapterTableContext({ podficId, podficTitle });

  let tableComponent = <></>;

  if (
    sectionType === SectionType.DEFAULT ||
    sectionType === SectionType.MULTIPLE_TO_SINGLE
  )
    tableComponent = <ChapterOnlyTable />;
  else if (sectionType === SectionType.CHAPTERS_SPLIT)
    tableComponent = <ChapterWithSubSectionsTable />;

  return (
    <div
      style={{
        overflowX: 'scroll',
      }}
    >
      <Typography variant='h2'>Chapters for {podficTitle}</Typography>
      <ChapterTableContext.Provider value={chapterTableContext}>
        {tableComponent}
      </ChapterTableContext.Provider>
    </div>
  );
}
