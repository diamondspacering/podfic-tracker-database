import { useDefaultSectionChaptersForPodfic } from '@/app/lib/swrLoaders';
import useChapterColumns from './useChapterColumns';
import { useContext, useMemo, useState } from 'react';
import useSectionColumns from './useSectionColumns';
import { createColumnHelper } from '@tanstack/react-table';
import { Button } from '@mui/material';
import { Mic } from '@mui/icons-material';
import Link from 'next/link';
import AddMenu from '@/app/ui/AddMenu';
import { EditCell } from '@/app/ui/table/EditCell';
import { usePathname } from 'next/navigation';
import CustomTable from '@/app/ui/table/CustomTable';
import {
  getDefaultColumnVisibility,
  useLengthColorScale,
} from '@/app/lib/utils';
import { ChapterTableContext } from './ChapterTableContext';
import {
  createUpdateChapterClient,
  updateSectionMinified,
} from '@/app/lib/updaters';

export default function ChapterOnlyTable() {
  const {
    getDefaultTableProps,
    expandCellComponent,
    getExpandedContentCellComponent,
    editingRowId,
    podficId,
    podficTitle,
  } = useContext(ChapterTableContext);
  const { sections, isLoading, mutate } = useDefaultSectionChaptersForPodfic({
    podficId,
  });

  const pathname = usePathname();

  const { mainColumns } = useChapterColumns({});
  const { metaColumns, postingColumns } = useSectionColumns({
    sections,
    editingRowId,
  });

  const [columnVisibility, setColumnVisibility] = useState(
    getDefaultColumnVisibility([
      ...mainColumns,
      ...metaColumns,
      ...postingColumns,
    ])
  );

  const lengthColorScale = useLengthColorScale(sections, 'length');

  const columnHelper = createColumnHelper<Chapter & Section>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'expand',
        cell: expandCellComponent,
      }),
      ...mainColumns,
      ...metaColumns,
      ...postingColumns,
      columnHelper.display({
        id: 'edit',
        cell: EditCell,
      }),
      columnHelper.display({
        id: 'add-related',
        cell: (props) => (
          <AddMenu
            podficTitle={podficTitle}
            podficId={props.row.getValue('podfic_id')}
            sectionId={props.row.getValue('section_id')}
            length={props.row.getValue('length')}
            options={['file', 'resource', 'note']}
          />
        ),
      }),
      columnHelper.display({
        id: 'add-recording-session',
        cell: (props) => (
          <Link
            href={`/forms/recording-session/new?section_id=${props.row.getValue(
              'section_id'
            )}&return_url=${pathname}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant='contained'
              style={{
                padding: '0px',
              }}
            >
              <Mic sx={{ padding: '0px' }} />
            </Button>
          </Link>
        ),
      }),
      columnHelper.display({
        id: 'generate-html',
        cell: (props) => (
          <Link
            href={`/dashboard/html?section_id=${props.row.getValue(
              'section_id'
            )}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant='contained'
              style={{
                padding: '0px',
              }}
            >
              HTML
            </Button>
          </Link>
        ),
      }),
    ],
    [
      columnHelper,
      expandCellComponent,
      mainColumns,
      metaColumns,
      pathname,
      podficTitle,
      postingColumns,
    ]
  );

  const defaultProps = getDefaultTableProps(columns);

  return (
    <CustomTable
      isLoading={isLoading}
      data={sections}
      columns={columns}
      rowKey='section_id'
      {...defaultProps}
      columnVisibility={columnVisibility}
      setColumnVisibility={setColumnVisibility}
      updateItemInline={async (section) => {
        await createUpdateChapterClient(section);
        await updateSectionMinified(JSON.stringify(section));
        await mutate();
      }}
      getExpandedContent={(row) =>
        getExpandedContentCellComponent(lengthColorScale, row)
      }
    />
  );
}
