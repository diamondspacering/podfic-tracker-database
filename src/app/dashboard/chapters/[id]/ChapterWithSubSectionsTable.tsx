import useChapterColumns from './useChapterColumns';
import {
  useMaxSectionLengthValues,
  usePodficChaptersWithSubSections,
} from '@/app/lib/swrLoaders';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getDefaultColumnVisibility,
  useFixedColorScale,
} from '@/app/lib/utils';
import { Column, createColumnHelper } from '@tanstack/react-table';
import { EditCell } from '@/app/ui/table/EditCell';
import CustomTable from '@/app/ui/table/CustomTable';
import SectionOnlyTable from './SectionOnlyTable';
import { ChapterTableContext } from './ChapterTableContext';
import { createUpdateChapterClient } from '@/app/lib/updaters';
import ColumnVisibilityToggleContainer from '@/app/ui/table/ColumnVisibilityToggleContainer';

interface SectionTableColumns<T> {
  [x: number]: Column<T, unknown>[];
}

export default function ChapterWithSubSectionsTable() {
  const { podficId, getDefaultTableProps } = useContext(ChapterTableContext);
  const { chapters, isLoading, mutate } = usePodficChaptersWithSubSections({
    podficId,
  });

  const { mainColumns } = useChapterColumns({ longChapterNumber: true });

  const [chapterColumnVisibility, setChapterColumnVisibility] = useState(
    getDefaultColumnVisibility(mainColumns),
  );

  const [chapterTableColumns, setChapterTableColumns] = useState<
    Column<Chapter, unknown>[]
  >([]);
  const [sectionTableColumns, setSectionTableColumns] = useState<
    SectionTableColumns<Section>
  >({});

  const chapterColumnSetter = useCallback(
    (columns: Column<Chapter, unknown>[]) => setChapterTableColumns(columns),
    [],
  );

  const sectionColumnSetter = useCallback(
    (columns: Column<Section, unknown>[], rowIndex: number) => {
      console.log('setting section columns', columns, rowIndex);
      if (isLoading || !chapters.length) return;
      setSectionTableColumns((prev) => ({
        ...prev,
        [rowIndex]: columns,
      }));
    },
    [chapters.length, isLoading],
  );

  const tableColumns = useMemo(() => {
    const allSectionColumns = Object.values(sectionTableColumns).flat();
    const columns: Column<any, unknown>[] = [
      ...chapterTableColumns,
      ...allSectionColumns,
    ] as unknown as Column<any, unknown>[];
    return columns;
  }, [chapterTableColumns, sectionTableColumns]);

  useEffect(() => console.log({ sectionTableColumns }), [sectionTableColumns]);

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
    <div>
      <ColumnVisibilityToggleContainer columns={tableColumns} />
      <CustomTable
        {...defaultTableProps}
        isLoading={isLoading}
        data={chapters}
        columns={chapterColumns}
        rowKey='chapter_id'
        columnVisibility={chapterColumnVisibility}
        setColumnVisibility={setChapterColumnVisibility}
        showColumnVisibility={false}
        setAllColumns={chapterColumnSetter}
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
                setAllColumns={sectionColumnSetter}
                rowIndex={row.index}
              />
            </td>
          </tr>
        )}
      />
    </div>
  );
}
