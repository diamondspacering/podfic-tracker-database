import useChapterColumns from './useChapterColumns';
import {
  useMaxSectionLengthValues,
  usePodficChaptersWithSubSections,
} from '@/app/lib/swrLoaders';
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
import { createUpdateChapterClient } from '@/app/lib/updaters';

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

  const { maxLength, mutate: sectionLengthMutate } = useMaxSectionLengthValues({
    podficId,
  });
  const lengthColorScale = useFixedColorScale(maxLength);

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
        await createUpdateChapterClient(chapter);
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
                await mutate();
                await sectionLengthMutate();
              }}
              lengthColorScale={lengthColorScale}
            />
          </td>
        </tr>
      )}
    />
  );
}
