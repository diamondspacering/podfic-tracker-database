import {
  format2Digits,
  formatDateString,
  getLengthText,
} from '@/app/lib/format';
import { useRecordingSessions } from '@/app/lib/swrLoaders';
import { getDefaultLength } from '@/app/types';
import { createColumnHelper } from '@tanstack/react-table';
import ColorScale from 'color-scales';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TableCell } from './TableCell';
import Link from 'next/link';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Delete, Edit, OpenInNew } from '@mui/icons-material';
import { mutate } from 'swr';
import { getLengthValue } from '@/app/lib/lengthHelpers';
import CustomTable from './CustomTable';
import { getDefaultColumnVisibility } from '@/app/lib/utils';

interface RecordingSessionTableProps {
  podficId: number | string;
  sectionId?: number | string;
  full?: boolean;
  returnUrl: string;
}

export default function RecordingSessionTable({
  podficId,
  sectionId,
  full,
  returnUrl,
}: RecordingSessionTableProps) {
  const { recordingSessions, isLoading } = useRecordingSessions({
    podficId,
    sectionId,
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
    columnHelper.accessor('section_id', {
      header: 'Section ID',
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
      <CustomTable
        isLoading={isLoading}
        data={recordingSessions}
        columns={columns}
        columnVisibility={getDefaultColumnVisibility(columns)}
        rowKey='recording_id'
      />
    </div>
  );
}
