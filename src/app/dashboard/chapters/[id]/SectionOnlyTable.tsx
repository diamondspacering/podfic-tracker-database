import {
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';
import { ChapterTableContext } from './ChapterTableContext';
import useSectionColumns from './useSectionColumns';
import CustomTable from '@/app/ui/table/CustomTable';
import ColorScale from 'color-scales';
import { Column, createColumnHelper } from '@tanstack/react-table';
import { EditCell } from '@/app/ui/table/EditCell';
import AddMenu from '@/app/ui/AddMenu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Mic } from '@mui/icons-material';
import { Button } from '@mui/material';
import { TableCell } from '@/app/ui/table/TableCell';
import { getDefaultColumnVisibility } from '@/app/lib/utils';
import { updateSectionMinified } from '@/app/lib/updaters';

interface SectionOnlyTableProps {
  sections: Section[];
  isLoading: boolean;
  submitCallback: () => Promise<void>;
  lengthColorScale: ColorScale;
  setAllColumns?: (
    columns: Column<Section, unknown>[],
    rowIndex: number,
  ) => void;
  rowIndex?: number;
}

export default function SectionOnlyTable({
  sections,
  isLoading,
  submitCallback,
  lengthColorScale,
  setAllColumns,
  rowIndex,
}: SectionOnlyTableProps) {
  const {
    podficId,
    podficTitle,
    getDefaultTableProps,
    editingRowId,
    expandCellComponent,
    getExpandedContentCellComponent,
  } = useContext(ChapterTableContext);

  const pathname = usePathname();

  const { titleColumn, metaColumns, postingColumns } = useSectionColumns({
    sections,
    editingRowId,
  });
  const columnHelper = createColumnHelper<Section>();

  const columns = [
    columnHelper.display({
      id: 'expand',
      cell: expandCellComponent,
    }),
    columnHelper.accessor('podfic_id', {
      header: 'Podfic ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
      },
    }),
    ...titleColumn,
    ...metaColumns,
    ...postingColumns,
    columnHelper.display({
      id: 'edit',
      cell: EditCell,
    }),
    // columnHelper.display({
    //   id: 'add-related',
    //   cell: (props) => (
    //     <AddMenu
    //       podficTitle={podficTitle}
    //       podficId={props.row.getValue('podfic_id')}
    //       sectionId={props.row.getValue('section_id')}
    //       length={props.row.getValue('length')}
    //       options={['file', 'resource', 'note']}
    //     />
    //   ),
    // }),
    columnHelper.display({
      id: 'add-recording-session',
      cell: (props) => (
        <Link
          href={`/forms/recording-session/new?section_id=${props.row.getValue(
            'section_id',
          )}&podfic_id=${podficId}&return_url=${pathname}`}
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
            'section_id',
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
  ];

  const [columnVisibility, setColumnVisibility] = useState(
    getDefaultColumnVisibility(columns),
  );

  const defaultProps = getDefaultTableProps(columns);

  const setAllColumnsSetter = useCallback(
    (columns) => setAllColumns(columns, rowIndex),
    [rowIndex],
  );

  return (
    <CustomTable
      {...defaultProps}
      isLoading={isLoading}
      data={sections}
      columns={columns}
      rowKey='section_id'
      showRowCount={false}
      showColumnVisibility={false}
      columnVisibility={columnVisibility}
      setColumnVisibility={setColumnVisibility}
      setAllColumns={setAllColumnsSetter}
      updateItemInline={async (section) => {
        await updateSectionMinified(JSON.stringify(section));
        await submitCallback();
      }}
      getExpandedContent={(row) =>
        getExpandedContentCellComponent(lengthColorScale, row)
      }
    />
  );
}
