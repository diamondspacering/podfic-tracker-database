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

const EMPTY_OBJ = {};

export default function ChapterWithSubSectionsTable() {
  const { podficId, getDefaultTableProps } = useContext(ChapterTableContext);
  const { chapters, isLoading, mutate } = usePodficChaptersWithSubSections({
    podficId,
  });

  const { mainColumns } = useChapterColumns({ longChapterNumber: true });

  const [chapterColumnVisibility, setChapterColumnVisibility] = useState(
    getDefaultColumnVisibility(mainColumns),
  );

  // ok so this isn't working. it changes for...the last one only...?
  const [chapterTableColumns, setChapterTableColumns] = useState<
    Column<Chapter, unknown>[]
  >([]);
  // const [sectionTableColumns, setSectionTableColumns] = useState<
  //   Record<number, Column<Section, unknown>[]>
  // >({});
  // TODO: perhaps a memoization or smth for the lady?
  const [sectionTableColumns, setSectionTableColumns] = useState<
    SectionTableColumns<Section>
  >({});
  const [tempVar, setTempVar] = useState(EMPTY_OBJ);

  const sectionColumnSetter = useCallback(
    (columns: Column<Section, unknown>[], rowIndex?: number) => {
      console.log('setting section columns', columns, rowIndex);
      if (!rowIndex) return;
      setSectionTableColumns((prev) => ({
        ...prev,
        [rowIndex]: columns,
      }));
    },
    [],
  );

  // const tableColumns = useMemo(
  //   () => [...chapterTableColumns, ...sectionTableColumns],
  //   [chapterTableColumns, sectionTableColumns],
  // );
  // this just changes the first one bc of how the guy works. u could fix it by updating the custom guy? idk man. or having an effect to change all the listed ones
  // this also reloads infinitely which is super cool n sexy
  // or just like. send the column thing a whole list of eeeeverything and it like. dedupes by id lol. wait that could be good
  // does this need to be a callback.
  const tableColumns = useMemo(() => {
    const sectionColumns = sectionTableColumns[1] ? sectionTableColumns[1] : [];
    console.log({ sectionColumns, sectionTableColumns });
    const allSectionColumns = Object.values(sectionTableColumns).flat();
    console.log({ allSectionColumns });
    const columns: Column<any, unknown>[] = [
      ...chapterTableColumns,
      // ...Object.keys(sectionColumns).flatMap((key) => sectionColumns[key]),
      ...allSectionColumns,
    ] as unknown as Column<any, unknown>[];
    console.log({ columns });
    return columns;
  }, [chapterTableColumns, sectionTableColumns]);

  useEffect(() => console.log({ sectionTableColumns }), [sectionTableColumns]);

  useEffect(() => console.log({ tableColumns }), [tableColumns]);

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

  const tempSetter = useCallback((columns) => {
    setChapterTableColumns(columns);
    setTempVar({ 1: 'heemo' });
    console.log('running 1');
  }, []);

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
        setAllColumns={tempSetter}
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
