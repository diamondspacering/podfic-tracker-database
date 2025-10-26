'use client';

import { Fragment, useState } from 'react';
import { createColumnHelper, flexRender } from '@tanstack/react-table';
import { TableCell } from './TableCell';
import { Button, IconButton } from '@mui/material';
import {
  Add,
  ArrowForward,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import EventDialog from '../event/event-dialog';
import EventPodficTable from './EventPodficTable';
import Link from 'next/link';
import CustomTable from './CustomTable';
import { useEvents } from '@/app/lib/swrLoaders';
import { mutate } from 'swr';

export default function EventTable() {
  const { events, isLoading } = useEvents();

  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const columnHelper = createColumnHelper<Event & EventParent>();

  const [expandedEventIds, setExpandedEventIds] = useState<number[]>([]);

  const columns = [
    columnHelper.accessor('event_parent_id', {
      header: 'Parent ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
      },
    }),
    columnHelper.accessor('event_id', {
      header: 'Event ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
      },
    }),
    // TODO: make this actually work correctly for event podfics
    columnHelper.display({
      id: 'expand',
      cell: (props) =>
        props.row.original.events ? (
          <></>
        ) : (
          <IconButton
            style={{
              padding: '0px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('toggling expand for row', props.row.original);
              // props.row.toggleExpanded();
              if (expandedEventIds.includes(props.row.original.event_id)) {
                setExpandedEventIds((prev) =>
                  prev.filter((id) => id !== props.row.original.event_id)
                );
              } else {
                setExpandedEventIds((prev) => [
                  ...prev,
                  props.row.original.event_id,
                ]);
              }
            }}
          >
            {expandedEventIds.includes(props.row.original.event_id) ? (
              <KeyboardArrowDown />
            ) : (
              <KeyboardArrowRight />
            )}
          </IconButton>
        ),
    }),
    columnHelper.accessor('name', {
      header: 'Name',
      cell: TableCell,
      meta: {
        type: 'string',
      },
    }),
    columnHelper.accessor('year', {
      header: 'Year',
      cell: TableCell,
      meta: {
        type: 'date',
      },
    }),
    // TODO: display this conditionally and make it point to the right thing
    columnHelper.display({
      id: 'voiceteam-link',
      cell: (props) => (
        <Link href={`/dashboard/voiceteam/${props.row.original.event_id}`}>
          <IconButton sx={{ padding: '0px' }}>
            <ArrowForward />
          </IconButton>
        </Link>
      ),
    }),
    columnHelper.accessor('description', {
      header: 'Description',
      cell: TableCell,
      meta: {
        type: 'text',
      },
    }),
  ];

  return (
    <div>
      <EventDialog
        isOpen={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        submitCallback={async () => {
          await mutate('/db/events');
          setEventDialogOpen(false);
        }}
        submitParentCallback={async () => {
          await mutate('/db/events');
        }}
        parents={events}
      />
      <Button
        variant='contained'
        onClick={() => setEventDialogOpen(true)}
        startIcon={<Add />}
      >
        Add Event
      </Button>
      <CustomTable
        isLoading={isLoading}
        data={events}
        columns={columns}
        rowKey='event_parent_id'
        showRowCount
        editingRowId={null}
        setEditingRowId={() => {}}
        columnFilters={[]}
        setColumnFilters={() => {}}
        columnVisibility={columns.reduce((acc, column) => {
          if ((column.meta as any)?.hidden && (column as any)?.accessorKey) {
            acc[(column as any).accessorKey as string] = false;
          }
          return acc;
        }, {})}
        rowCanExpand
        rowsAlwaysExpanded
        getSubRows={(row) => row.events ?? []}
        getExpandedContent={(row) =>
          row.subRows?.map((subRow) => {
            return (
              <Fragment key={subRow.id}>
                <tr key={`subRow-${subRow.id}`} id={`subRow-${subRow.id}`}>
                  {subRow.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        paddingLeft: cell.column.id === 'name' ? '30px' : '0px',
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {expandedEventIds.includes(subRow.original.event_id) && (
                  <tr id={`subRow-${subRow.id}-expanded`}>
                    <td
                      key='1'
                      colSpan={row.getAllCells().length}
                      style={{
                        paddingLeft: '60px',
                      }}
                    >
                      <EventPodficTable eventId={subRow.original.event_id} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })
        }
        updateItemInline={async () => {}}
      />
    </div>
  );
}
