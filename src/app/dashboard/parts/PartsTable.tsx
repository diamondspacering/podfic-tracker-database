'use client';

import { useParts } from '@/app/lib/swrLoaders';
import { arrayIncludesFilter, useLengthColorScale } from '@/app/lib/utils';
import { usePersistentState } from '@/app/lib/utilsFrontend';
import { EditCell } from '@/app/ui/table/EditCell';
import { TableCell } from '@/app/ui/table/TableCell';
import { Mic, OpenInNew } from '@mui/icons-material';
import { Button, IconButton, Typography } from '@mui/material';
import {
  ColumnFiltersState,
  createColumnHelper,
  VisibilityState,
} from '@tanstack/react-table';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { updatePartAndSectionMinified } from '@/app/lib/updaters';
import { mutate } from 'swr';
import { FilterType, PartStatus } from '@/app/types';
import { HeaderCell } from '@/app/ui/table/HeaderCell';
import CustomTable from '@/app/ui/table/CustomTable';

// parts to section is one-to-many technically but we are ignoring that
export default function PartsTable() {
  const { parts, isLoading } = useParts();

  const pathname = usePathname();

  const columnHelper = createColumnHelper<PartWithContext>();

  const [columnFilters, setColumnFilters] =
    usePersistentState<ColumnFiltersState>('PARTS_TABLE_COLUMN_FILTERS', []);
  useEffect(() => console.log({ columnFilters }), [columnFilters]);

  const rawColorScale = useLengthColorScale(parts, 'raw_length');
  const lengthColorScale = useLengthColorScale(parts, 'length');

  const updatePart = async (part: PartWithContext) => {
    console.log('updating part');
    try {
      await updatePartAndSectionMinified(JSON.stringify(part));
      await mutate('/db/parts');
      console.log('finished updating part');
    } catch (e) {
      console.error('Error updating part:', e);
    }
  };

  const columns = [
    columnHelper.accessor('part_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
        columnName: 'ID',
      },
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
    columnHelper.accessor('chapter_id', {
      header: 'Chapter ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
      },
    }),
    columnHelper.accessor('text_link', {
      header: 'Doc',
      cell: TableCell,
      meta: {
        type: 'link',
      },
    }),
    columnHelper.accessor('audio_link', {
      header: 'Audio',
      cell: TableCell,
      meta: {
        type: 'link',
      },
    }),
    columnHelper.accessor('username', {
      header: 'Organizer',
      cell: TableCell,
      meta: {
        type: 'string',
        immutable: true,
      },
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: TableCell,
      meta: {
        type: 'text',
        immutable: true,
      },
    }),
    columnHelper.accessor('part', {
      header: 'Part',
      cell: TableCell,
      meta: {
        type: 'text',
      },
    }),
    columnHelper.accessor('wordcount', {
      header: 'Words',
      cell: TableCell,
      meta: {
        type: 'number',
      },
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: TableCell,
      meta: {
        type: 'string',
        immutable: true,
      },
    }),
    columnHelper.accessor('length', {
      header: 'Length',
      cell: TableCell,
      meta: {
        type: 'length',
        colorScale: lengthColorScale,
      },
    }),
    columnHelper.accessor('raw_length', {
      header: 'Raw Length',
      cell: TableCell,
      meta: {
        type: 'length',
        colorScale: rawColorScale,
        immutable: true,
      },
    }),
    columnHelper.accessor('event_name', {
      header: (props) => <HeaderCell text='Event' {...props} />,
      cell: TableCell,
      meta: {
        type: 'string',
        immutable: true,
        columnName: 'Event',
        filterType: FilterType.STRING,
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('status', {
      header: (props) => <HeaderCell text='Status' {...props} />,
      cell: TableCell,
      meta: {
        type: 'status',
        statusType: 'part',
        filterType: FilterType.PART_STATUS,
        options: Object.values(PartStatus).map((status) => ({
          label: status,
          value: status,
        })),
        columnName: 'status',
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.display({
      id: 'edit-inline',
      cell: EditCell,
    }),
    columnHelper.display({
      id: 'edit-full',
      cell: (props) => (
        <Link
          href={`/forms/part/${props.row.original.part_id}`}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton style={{ padding: '0px' }}>
            <span style={{ whiteSpace: 'nowrap' }}>
              <OpenInNew />
            </span>
          </IconButton>
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'add-recording-session',
      cell: (props) => (
        <Link
          href={`/forms/recording-session/new?section_id=${props.row.original.section_id}&part_id=${props.row.original.part_id}&return_url=${pathname}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant='contained' style={{ padding: '0px' }}>
            <Mic sx={{ padding: '0px' }} />
          </Button>
        </Link>
      ),
    }),
  ];

  const [columnVisibility, setColumnVisibility] =
    usePersistentState<VisibilityState>(
      'PARTS_TABLE_COLUMN_VISIBILITY',
      columns.reduce((acc, column) => {
        acc[column.id] = (column.meta as any)?.hidden;
        return acc;
      }, {})
    );

  const [editingRowId, setEditingRowId] = useState(null);

  return (
    <div>
      <Typography variant='h2'>Parts</Typography>
      <CustomTable
        isLoading={isLoading}
        data={parts}
        columns={columns}
        rowKey='part_id'
        editingRowId={editingRowId}
        setEditingRowId={setEditingRowId}
        updateItemInline={async (item) => {
          await updatePart(item);
        }}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        showClearFilters
        showColumnVisibility
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />
    </div>
  );
}
