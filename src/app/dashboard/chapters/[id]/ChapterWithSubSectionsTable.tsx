import useChapterColumns from './useChapterColumns';
import { usePodficChaptersWithSubSections } from '@/app/lib/swrLoaders';
import { useContext, useState } from 'react';
import {
  getDefaultColumnVisibility,
  useFixedColorScale,
} from '@/app/lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import { EditCell } from '@/app/ui/table/EditCell';
import CustomTable from '@/app/ui/table/CustomTable';
import SectionOnlyTable from './SectionOnlyTable';
import { ChapterTableContext } from './ChapterTableContext';

export default function ChapterWithSubSectionsTable() {
  const { podficId, getDefaultTableProps } = useContext(ChapterTableContext);
  const { chapters, isLoading, mutate } = usePodficChaptersWithSubSections({
    podficId,
  });

  const { mainColumns } = useChapterColumns({ longChapterNumber: true });

  const [columnVisibility, setColumnVisibility] = useState(
    getDefaultColumnVisibility(mainColumns)
  );

  const chapterColumnHelper = createColumnHelper<Chapter>();

  // TODO: hmmm you can't do that chapters don't got length any more. a fixed max? alternately getting the max len from a select?
  // const lengthColorScale = useLengthColorScale(chapters, 'length');
  // TODO: fix this
  // const { maxSectionLength } = useMaxSectionLength({ podficId });
  // const lengthColorScale = useFixedColorScale(
  //   getLengthValue(maxSectionLength) ? getLengthValue(maxSectionLength) : 1
  // );
  const lengthColorScale = useFixedColorScale(1);

  const chapterColumns = [
    ...mainColumns,
    chapterColumnHelper.display({
      id: 'edit',
      cell: EditCell,
    }),
  ];

  const defaultTableProps = getDefaultTableProps(chapterColumns);

  return (
    <CustomTable
      {...defaultTableProps}
      isLoading={isLoading}
      data={chapters}
      columns={chapterColumns}
      rowKey='chapter_id'
      columnVisibility={columnVisibility}
      setColumnVisibility={setColumnVisibility}
      updateItemInline={async (chapter) => {
        console.log(chapter);
        // await updateChapter
      }}
      rowsAlwaysExpanded={true}
      getExpandedContent={(row) => (
        <tr>
          <td
            key='1'
            colSpan={row.getVisibleCells().length}
            style={{ paddingLeft: '5px' }}
          >
            <SectionOnlyTable
              sections={row.original.sections ?? []}
              isLoading={isLoading}
              submitCallback={async () => {
                console.log('submit callback');
                await mutate();
              }}
              lengthColorScale={lengthColorScale}
            />
          </td>
        </tr>
      )}
    />
  );
}
