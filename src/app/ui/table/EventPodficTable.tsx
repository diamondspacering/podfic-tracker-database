import { fetcher, useEventPodfics } from '@/app/lib/swrLoaders';
import { useEffect, useMemo } from 'react';
import useSWR from 'swr';
import tableStyles from './table.module.css';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TableCell } from './TableCell';
import { sourceCodePro } from '@/app/fonts/fonts';
import ColorScale from 'color-scales';
import { getLengthValue } from '@/app/lib/format';
import { getDefaultLength } from '@/app/types';
import { Edit, OpenInNew } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import Link from 'next/link';

export default function EventPodficTable({ eventId }) {
  const { podfics } = useEventPodfics(eventId);

  useEffect(() => console.log({ podfics }), [podfics]);

  const lengthColorScale = useMemo(
    () =>
      new ColorScale(
        0,
        podfics?.length
          ? Math.max(
              ...podfics.map((podfic) =>
                getLengthValue(podfic.length ?? getDefaultLength())
              )
            )
          : 1,
        ['#ffffff', '#4285f4']
      ),
    [podfics]
  );
  const wordcountColorScale = useMemo(
    () =>
      new ColorScale(
        0,
        podfics?.length
          ? Math.max(
              ...podfics.map((podfic) =>
                typeof podfic.wordcount === 'string'
                  ? parseInt(podfic.wordcount)
                  : podfic.wordcount ?? 0
              )
            )
          : 1,
        ['#ffffff', '#4285f4']
      ),
    [podfics]
  );

  const columnHelper = createColumnHelper<Podfic & Work & Author>();

  const columns = [
    columnHelper.accessor('podfic_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
      },
    }),
    columnHelper.display({
      id: 'number',
      cell: (props) => (
        <span className={`${sourceCodePro.className} ${tableStyles.smallText}`}>
          {props.row.index + 1}
        </span>
      ),
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: TableCell,
      meta: {
        type: 'text',
        maxWidth: '300px',
        immutable: true,
      },
    }),
    // TODO: add fandoms? def do that later lmao
    // columnHelper.accessor('fandom_name', {
    //   header: 'Fandom',
    //   cell: TableCell,
    //   // TODO: figure out how to get the autocomplete data lol
    //   // maybe have a fetcher function that returns the right things?
    //   // yeahhh a client fetcher could make a lot of sense
    //   meta: {
    //     type: 'autocomplete',
    //   },
    // }),
    columnHelper.accessor('wordcount', {
      header: 'Wordcount',
      cell: TableCell,
      // TODO: color scale lol
      meta: {
        type: 'colorScale',
        colorScale: wordcountColorScale,
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
    columnHelper.accessor('status', {
      header: 'Status',
      cell: TableCell,
      meta: {
        type: 'status',
      },
    }),
    columnHelper.accessor('permission_status', {
      header: 'Permission',
      cell: TableCell,
      meta: {
        type: 'status',
      },
    }),
    columnHelper.accessor('chapter_count', {
      header: 'Chapters',
      cell: TableCell,
      meta: {
        type: 'number',
      },
    }),
    columnHelper.accessor('notes', {
      header: 'Event Note',
      cell: ({ getValue, ...rest }) => (
        <TableCell
          getValue={() =>
            getValue().find((note) => note.label === 'Event Note')?.value ?? ''
          }
          {...rest}
        />
      ),
      meta: {
        type: 'text-block',
      },
    }),
    columnHelper.display({
      id: 'edit-full',
      cell: (props) => (
        <Link
          href={`/forms/podfic/${props.row.getValue('podfic_id')}`}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            style={{
              padding: '0px',
            }}
          >
            <span
              style={{
                whiteSpace: 'nowrap',
              }}
            >
              <Edit />
              <OpenInNew />
            </span>
          </IconButton>
        </Link>
      ),
    }),
    // TODO: ability to add notes
  ];

  const table = useReactTable({
    data: podfics,
    columns,
    getCoreRowModel: getCoreRowModel<Podfic & Work & Author>(),
    initialState: {
      columnVisibility: columns.reduce((acc, column) => {
        if ((column.meta as any)?.hidden && (column as any)?.accessorKey) {
          acc[(column as any).accessorKey as string] = false;
        }
        return acc;
      }, {}),
    },
  });

  return (
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
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={columns.length}>
            {podfics?.reduce((acc, podfic) => {
              return acc + podfic.chapter_count;
            }, 0)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
