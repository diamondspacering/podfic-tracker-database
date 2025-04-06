import {
  format2Digits,
  formatDateString,
  getLengthText,
  getLengthValue,
} from '@/app/lib/format';
import { useRecordingSessions } from '@/app/lib/swrLoaders';
import { getDefaultLength } from '@/app/types';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import ColorScale from 'color-scales';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TableCell } from './TableCell';
import Link from 'next/link';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Delete, Edit, OpenInNew } from '@mui/icons-material';
import { mutate } from 'swr';
import tableStyles from '@/app/ui/table/table.module.css';

interface RecordingSessionTableProps {
  podficId: number | string;
  chapterId?: number | string;
  full?: boolean;
  returnUrl: string;
}

export default function RecordingSessionTable({
  podficId,
  chapterId,
  full,
  returnUrl,
}: RecordingSessionTableProps) {
  const { recordingSessions, isLoading } = useRecordingSessions({
    podficId,
    chapterId,
    full,
  });

  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState(-1);

  const deleteRecording = useCallback(async () => {
    const recordingObject = recordingSessions?.find(
      (recording) => recording.recording_id === selectedRecording
    );
    await fetch(`/db/recording_sessions/${selectedRecording}`, {
      method: 'DELETE',
    });
    await mutate(
      (key) =>
        Array.isArray(key) &&
        key[0] === '/db/recording_sessions' &&
        key[1] === recordingObject.podfic_id
    );
    setDeleteConfirmDialogOpen(false);
  }, [selectedRecording, recordingSessions]);

  useEffect(() => console.log({ recordingSessions }), [recordingSessions]);

  const lengthColorScale = useMemo(() => {
    new ColorScale(
      0,
      recordingSessions?.length
        ? Math.max(
            ...recordingSessions.map((recording) =>
              getLengthValue(recording.length ?? getDefaultLength())
            )
          )
        : 1,
      ['#ffffff', '#4285f4']
    );
  }, [recordingSessions]);

  const columnHelper = createColumnHelper<RecordingSession>();

  const columns = [
    columnHelper.accessor('recording_id', {
      header: 'Recording ID',
      cell: TableCell,
      meta: {
        type: 'number',
        hidden: true,
      },
    }),
    columnHelper.accessor('podfic_id', {
      header: 'Podfic ID',
      cell: TableCell,
      meta: {
        type: 'number',
        hidden: true,
      },
    }),
    columnHelper.accessor('chapter_id', {
      header: 'Chapter ID',
      cell: TableCell,
      meta: {
        type: 'number',
        hidden: true,
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
    columnHelper.accessor('date', {
      header: 'Date',
      cell: (props) => (
        <TableCell
          {...props}
          getValue={() =>
            props.getValue()
              ? formatDateString(new Date(props.getValue()))
              : props.row.original.month
              ? `${format2Digits(parseInt(props.row.original.month))}-${
                  props.row.original.year
                }`
              : props.row.original.year
          }
        />
      ),
      meta: {
        type: 'date',
      },
    }),
    columnHelper.display({
      id: 'edit',
      cell: (props) => (
        <Link
          href={`/forms/recording-session/${props.row.getValue(
            'recording_id'
          )}?return_url=${returnUrl}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ whiteSpace: 'nowrap' }}>
            <Edit />
            <OpenInNew />
          </span>
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'delete',
      cell: (props) => (
        <Button
          onClick={() => {
            setSelectedRecording(props.row.getValue('recording_id'));
            setDeleteConfirmDialogOpen(true);
          }}
          style={{ padding: '0px' }}
        >
          <Delete />
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data: recordingSessions,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
    <div>
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
      >
        <DialogTitle>
          Are you sure you want to delete this recording session?
        </DialogTitle>
        <DialogContent>
          Length:{' '}
          {getLengthText(
            recordingSessions?.find(
              (recording) => recording.recording_id === selectedRecording
            )?.length
          )}
          Date:{' '}
          {
            recordingSessions?.find(
              (recording) => recording.recording_id === selectedRecording
            )?.date
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant='contained'
            style={{ backgroundColor: 'red' }}
            onClick={deleteRecording}
          >
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
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
          {/* TODO: better loading state */}
          {isLoading && (
            <tr>
              <td>
                <CircularProgress />
              </td>
            </tr>
          )}
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
