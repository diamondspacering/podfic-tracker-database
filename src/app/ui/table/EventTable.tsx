'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import tableStyles from './table.module.css';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { TableCell } from './TableCell';
import { Button, CircularProgress, IconButton } from '@mui/material';
import {
  Add,
  ArrowForward,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import EventDialog from '../event/event-dialog';
import EventPodficTable from './EventPodficTable';
import Link from 'next/link';

// TODO: better styling? this works but he ugly

// TODO: a way to revalidate?
export default function EventTable() {
  const [events, setEvents] = useState<EventParent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  // TODO: should this be in here, or should it be in a parent component? I'd rather edit in a dialog. how to indicate what's inline vs. a dialog?
  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    try {
      const response = await fetch(`/db/events`);
      const data = await response.json();
      console.log({ data });
      setEvents(data);
    } catch (e) {
      console.error('Error fetching events:', e);
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const columnHelper = createColumnHelper<Event & EventParent>();

  const [expandedEventIds, setExpandedEventIds] = useState<number[]>([]);

  // TODO: expandable resources for event - use the usual resource table
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
    // TODO: reusable expand component? ooooh i love that
    columnHelper.display({
      id: 'expand',
      cell: (props) =>
        props.row.original.events ? (
          <></>
        ) : (
          <IconButton
            style={{
              padding: '0px',
              // transitionDuration: '0.4s',
              // transitionProperty: 'transform',
              // ...(props.row.getIsExpanded()
              //   ? { transform: 'rotate(90deg)' }
              //   : {}),
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

  // this is not set up well I am sacrificing much for the subrows
  const table = useReactTable({
    data: events as (EventParent & Event)[],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSubRows: (row) => row.events ?? [],
    getRowCanExpand: () => true,
    getIsRowExpanded: () => true,
    initialState: {
      columnVisibility: columns.reduce((acc, column) => {
        if ((column.meta as any)?.hidden && (column as any)?.accessorKey) {
          acc[(column as any).accessorKey as string] = false;
        }
        return acc;
      }, {}),
    },
    meta: {
      editingRowId: null,
      setEditingRowId: () => {},
    },
  });

  return (
    <div>
      <EventDialog
        isOpen={eventDialogOpen}
        onClose={() => setEventDialogOpen(false)}
        submitCallback={async () => {
          await fetchEvents();
          setEventDialogOpen(false);
        }}
        submitParentCallback={async () => {
          await fetchEvents();
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
      <table
        className={tableStyles.table}
        style={{
          marginTop: '2rem',
        }}
      >
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
          {eventsLoading && (
            <tr>
              <td>
                <CircularProgress />
              </td>
            </tr>
          )}
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() &&
                row.subRows?.map((subRow) => {
                  return (
                    <Fragment key={subRow.id}>
                      <tr
                        key={`subRow-${subRow.id}`}
                        id={`subRow-${subRow.id}`}
                      >
                        {subRow.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            style={{
                              paddingLeft:
                                cell.column.id === 'name' ? '30px' : '0px',
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
                            <EventPodficTable
                              eventId={subRow.original.event_id}
                            />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
