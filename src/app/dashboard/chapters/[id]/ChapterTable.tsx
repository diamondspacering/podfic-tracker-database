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
// if chapters-split then show sections under chapter headers?
// if chapters-combine then show chapters included in sections under section headers
// maybe have a bolded thing, possibly w/ combined stats, and then chapters/sections under each? with stats? this. maay be difficult to put together w/ the current table methods. haha.
// and then whichever is the section needs the HTML but the chapter doesn't
// but whatever is nested needs the recording button
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

  // const updateChapter = async (chapter: Chapter) => {
  //   try {
  //     await fetch(`/db/chapters/${chapter.chapter_id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(chapter),
  //     });
  //     await mutate(`/db/chapters/${podficId}`);
  //     setEditingRowId(null);
  //   } catch (e) {
  //     console.error('Error updating chapter:', e);
  //   }
  // };

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
