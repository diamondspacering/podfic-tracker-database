'use client';

import { usePodficcers } from '@/app/lib/swrLoaders';
import { createColumnHelper } from '@tanstack/react-table';
import { Button, IconButton } from '@mui/material';
import { useState } from 'react';
import { TableCell } from './TableCell';
import { Add, Edit } from '@mui/icons-material';
import PodficcerDialog from '../podficcer/podficcer-dialog';
import CustomTable from './CustomTable';

export default function PodficcerTable() {
  const { podficcers, isLoading } = usePodficcers();

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

  return (
    <div>
      <PodficcerDialog
        isOpen={podficcerDialogOpen}
        onClose={() => setPodficcerDialogOpen(false)}
        submitCallback={() => {
          setPodficcerDialogOpen(false);
        }}
        item={selectedPodficcer}
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
      <CustomTable
        isLoading={isLoading}
        data={podficcers}
        columns={columns}
        rowKey='podficcer_id'
        editingRowId={null}
        setEditingRowId={() => {}}
        columnVisibility={{ podficcer_id: false }}
        columnFilters={[]}
        setColumnFilters={() => {}}
        globalFilterFn='includesString'
        updateItemInline={async () => {}}
      />
    </div>
  );
}
