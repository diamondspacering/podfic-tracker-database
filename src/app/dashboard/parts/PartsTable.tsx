'use client';

import { useParts } from '@/app/lib/swrLoaders';
import { useLengthColorScale, usePersistentState } from '@/app/lib/utils';
import { EditCell } from '@/app/ui/table/EditCell';
import { TableCell } from '@/app/ui/table/TableCell';
import { Mic, OpenInNew } from '@mui/icons-material';
import { Button, IconButton, Typography } from '@mui/material';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import tableStyles from '@/app/ui/table/table.module.css';
import { updatePartMinified } from '@/app/lib/updaters';
import { mutate } from 'swr';

export default function PartsTable() {
  const { parts } = useParts();

  const pathname = usePathname();

  const columnHelper = createColumnHelper<PartWithContext>();

  const [columnFilters, setColumnFilters] =
    usePersistentState<ColumnFiltersState>('PARTS_TABLE_COLUMN_FILTERS', []);
  useEffect(() => console.log({ columnFilters }), [columnFilters]);

  const rawColorScale = useLengthColorScale(parts, 'raw_length');
  const lengthColorScale = useLengthColorScale(parts, 'length');

  // TODO: make this a general imported thing
  const arrayIncludesFilter = (row, columnId, filterValue) => {
    return filterValue.includes(row.getValue(columnId));
  };

  const updatePart = async (part: PartWithContext) => {
    console.log('updating part');
    try {
      await updatePartMinified(JSON.stringify(part));
      await mutate('/db/parts');
      console.log('finished updating part');
    } catch (e) {
      console.error('Error updating part:', e);
    }
  };

  // TODO: audio link?
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
    columnHelper.accessor('doc', {
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
    // TODO: make a dropdown for that maybe? nah it can just be in the full edit yknow
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
    columnHelper.accessor('words', {
      header: 'Words',
      cell: TableCell,
      meta: {
        type: 'number',
      },
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: TableCell,
      // TODO: make this selectable?
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
      header: 'Event',
      cell: TableCell,
      meta: {
        type: 'string',
        immutable: true,
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: TableCell,
      meta: {
        type: 'status',
        statusType: 'part',
      },
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
          href={`/forms/recording-session/new?podfic_id=${props.row.original.podfic_id}&part_id=${props.row.original.part_id}&return_url=${pathname}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button variant='contained' style={{ padding: '0px' }}>
            <Mic sx={{ padding: '0px' }} />
          </Button>
        </Link>
      ),
    }),
  ];

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRow, setEditingRow] = useState<PartWithContext>({} as any);

  // TODO: update function

  const table = useReactTable({
    data: parts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.part_id?.toString(),
    initialState: {
      columnVisibility: columns.reduce((acc, column) => {
        acc[column.id] = (column.meta as any)?.hidden;
        return acc;
      }, {}),
    },
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters(updaterOrValue);
    },
    meta: {
      columnFilters,
      setColumnFilters,
      editingRowId,
      setEditingRowId,
      editingRow,
      setEditingRow,
      updateData: (_rowId, columnId, value) => {
        setEditingRow((prev) => ({ ...prev, [columnId]: value }));
      },
      revertRow: () => {
        setEditingRow(null);
      },
      submitRow: async () => {
        console.log({ editingRow });
        // TODO: updater
        await updatePart(editingRow);
      },
    },
  });

  return (
    <div>
      <Typography variant='h2'>Parts</Typography>
      <table className={tableStyles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr
                key={row.id}
                className={`${tableStyles.clickable} ${
                  row.getIsSelected() ? tableStyles.selected : ''
                }`}
                onClick={row.getToggleSelectedHandler()}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
