import { usePathname } from 'next/navigation';
import useChapterColumns from './useChapterColumns';
import {
  useMaxSectionLength,
  usePodficChaptersWithSubSections,
} from '@/app/lib/swrLoaders';
import { useContext, useState } from 'react';
import { ChapterTableContext } from './ChapterTable';
import {
  getDefaultColumnVisibility,
  useFixedColorScale,
  useLengthColorScale,
} from '@/app/lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import { EditCell } from '@/app/ui/table/EditCell';
import CustomTable from '@/app/ui/table/CustomTable';
import SectionOnlyTable from './SectionOnlyTable';
import { getLengthValue } from '@/app/lib/lengthHelpers';

export default function ChapterWithSubSectionsTable() {
  const { podficId, getDefaultTableProps } = useContext(ChapterTableContext);
  const { chapters, isLoading } = usePodficChaptersWithSubSections({
    podficId,
  });

  const pathname = usePathname();

  const { mainColumns } = useChapterColumns();

  const [columnVisibility, setColumnVisibility] = useState(
    getDefaultColumnVisibility(mainColumns)
  );

  const chapterColumnHelper = createColumnHelper<Chapter>();

  // TODO: hmmm you can't do that chapters don't got length any more. a fixed max? alternately getting the max len from a select?
  // const lengthColorScale = useLengthColorScale(chapters, 'length');
  const { maxSectionLength } = useMaxSectionLength({ podficId });
  const lengthColorScale = useFixedColorScale(getLengthValue(maxSectionLength));

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
            {/* <CustomTable
          isLoading={isLoading}
          data={row.original.sections}
          // TODO: uh oh! my hook needs the data! optional fixed??
          columns={[]}
          rowKey='section_id'
          showColumnVisibility={false}
          // TODO: this needs its own context my evil and beloathed child
        /> */}
            <SectionOnlyTable
              sections={row.original.sections ?? []}
              isLoading={isLoading}
              submitCallback={() => {
                console.log('submit callback');
                // put mutate here
              }}
              lengthColorScale={lengthColorScale}
            />
          </td>
        </tr>
      )}
    />
  );
}
