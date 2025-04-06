'use client';

import { usePodficcers } from '@/app/lib/swrLoaders';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import tableStyles from '@/app/ui/table/table.module.css';
import { Button, IconButton, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';
import { TableCell } from './TableCell';
import { Add, Close, Edit } from '@mui/icons-material';
import PodficcerDialog from '../podficcer/podficcer-dialog';

export default function PodficcerTable() {
  const { podficcers } = usePodficcers();

  const [podficcerDialogOpen, setPodficcerDialogOpen] = useState(false);
  const [selectedPodficcer, setSelectedPodficcer] = useState(null);

  const columnHelper = createColumnHelper<Podficcer>();

  const columns = [
    columnHelper.accessor('podficcer_id', {
      header: 'ID',
      cell: TableCell,
      meta: { type: 'number', immutable: true, hidden: true },
    }),
    columnHelper.accessor('username', {
      header: 'Username',
      cell: TableCell,
      meta: { type: 'string' },
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: TableCell,
      meta: { type: 'string' },
    }),
    columnHelper.accessor('profile', {
      header: 'Profile',
      cell: TableCell,
      meta: { type: 'link' },
    }),
    columnHelper.display({
      header: 'Edit',
      cell: (props) => (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPodficcer(props.row.original);
            setPodficcerDialogOpen(true);
          }}
        >
          <Edit />
        </IconButton>
      ),
    }),
  ];

  const table = useReactTable({
    data: podficcers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    initialState: {
      columnVisibility: {
        podficcer_id: false,
      },
    },
    meta: {
      editingRowId: null,
      setEditingRowId: () => {},
    },
  });

  // TODO: loading state
  return (
    <div>
      <TextField
        size='small'
        placeholder='Search...'
        value={table.getState().globalFilter}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => {
                    table.setGlobalFilter('');
                  }}
                >
                  <Close />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />
      <br />
      <br />
      <PodficcerDialog
        isOpen={podficcerDialogOpen}
        onClose={() => setPodficcerDialogOpen(false)}
        submitCallback={() => {
          setPodficcerDialogOpen(false);
        }}
        podficcer={selectedPodficcer}
      />
      <Button
        variant='contained'
        onClick={() => setPodficcerDialogOpen(true)}
        startIcon={<Add />}
      >
        Add Podficcer
      </Button>
      <br />
      <br />
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
      </table>
    </div>
  );
}
