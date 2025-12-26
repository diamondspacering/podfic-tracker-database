import { createColumnHelper } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import { TableCell } from './TableCell';
import tableStyles from '@/app/ui/table/table.module.css';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import FileDialog from '@/app/forms/podfic/file-dialog';
import { getLengthText } from '@/app/lib/format';
import { useFiles } from '@/app/lib/swrLoaders';
import { mutate } from 'swr';
import CustomTable from './CustomTable';

export default function FileTable({
  podficId,
  podficTitle,
  onlyNonAAFiles = false,
  sectionId,
  lengthColorScale = null,
}) {
  const { files, isLoading } = useFiles({
    podficId,
    sectionId,
    onlyNonAAFiles,
  });

  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(-1);

  const deleteFile = useCallback(async () => {
    await fetch(`/db/files/${selectedFile}`, {
      method: 'DELETE',
    });
    await mutate((key) => Array.isArray(key) && key[0] === '/db/files');
    setDeleteConfirmDialogOpen(false);
  }, [selectedFile]);

  const columnHelper = createColumnHelper<File>();

  const columns = [
    columnHelper.accessor('file_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
      },
    }),
    columnHelper.accessor('podfic_id', {
      header: 'Podfic ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
      },
    }),
    columnHelper.accessor('label', {
      header: 'Label',
      cell: TableCell,
      meta: {
        type: 'string',
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
    columnHelper.accessor('size', {
      header: 'MB',
      cell: TableCell,
      meta: {
        type: 'string',
      },
    }),
    columnHelper.accessor('filetype', {
      header: 'Type',
      cell: (props) => (
        <span className={tableStyles.tableCell}>
          <div
            style={{
              display: 'inline-block',
              width: 'fit-content',
              paddingBottom: '10px',
            }}
          >
            {props.row.getValue('filetype')}
          </div>
        </span>
      ),
      meta: {
        type: 'string',
      },
    }),
    columnHelper.accessor(
      (row) =>
        row.links?.find((link) => link.host === 'archive.org') ?? ({} as any),
      {
        header: 'archive.org',
        cell: ({ getValue, ...rest }) => (
          <TableCell getValue={() => getValue().link ?? ''} {...rest} />
        ),
        meta: {
          type: 'link',
          className: tableStyles.extraPadding,
        },
      }
    ),
    columnHelper.accessor(
      (row) =>
        row.links?.find((link) => link.host === 'audiofic archive') ??
        ({} as any),
      {
        header: 'aa',
        cell: ({ getValue, ...rest }) => (
          <TableCell getValue={() => getValue().link ?? ''} {...rest} />
        ),
        meta: {
          type: 'link',
          className: tableStyles.extraPadding,
        },
      }
    ),
    columnHelper.accessor(
      (row) =>
        row.links?.find((link) => link.host === 'Dropbox') ?? ({} as any),
      {
        header: 'Dropbox',
        cell: ({ getValue, ...rest }) => (
          <TableCell getValue={() => getValue().link ?? ''} {...rest} />
        ),
        meta: {
          type: 'link',
          className: tableStyles.extraPadding,
        },
      }
    ),
    columnHelper.display({
      id: 'edit',
      header: 'Edit',
      cell: (props) => (
        <IconButton
          onClick={() => {
            setEditingFile(props.row.original);
            setFileDialogOpen(true);
          }}
          style={{ padding: '0px' }}
        >
          <Edit />
        </IconButton>
      ),
    }),
    columnHelper.display({
      id: 'delete',
      header: 'Delete',
      cell: (props) => (
        <IconButton
          onClick={() => {
            setSelectedFile(props.row.getValue('file_id'));
            setDeleteConfirmDialogOpen(true);
          }}
          style={{ padding: '0px' }}
        >
          <Delete />
        </IconButton>
      ),
    }),
  ];

  return (
    <div>
      <FileDialog
        isOpen={fileDialogOpen}
        onClose={() => setFileDialogOpen(false)}
        submitCallback={async () => {
          await mutate((key) => Array.isArray(key) && key[0] === '/db/files');
          setFileDialogOpen(false);
        }}
        file={editingFile}
        podficId={podficId}
        podficTitle={podficTitle}
        existingLength={editingFile?.length}
      />
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
      >
        <DialogTitle>Are you sure you want to delete this file?</DialogTitle>
        <DialogContent>
          Label: {files?.find((file) => file.file_id === selectedFile)?.label}
          <br />
          Length:{' '}
          {getLengthText(
            files?.find((file) => file.file_id === selectedFile)?.length
          )}
          <br />
          Size: {files?.find((file) => file.file_id === selectedFile)?.size}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={deleteFile}>Delete</Button>
        </DialogActions>
      </Dialog>
      <CustomTable
        isLoading={isLoading}
        data={files}
        columns={columns}
        rowKey='file_id'
        rowCanExpand={false}
        columnFilters={[]}
        setColumnFilters={() => {}}
        editingRowId={null}
        setEditingRowId={() => {}}
        columnVisibility={{
          file_id: false,
          podfic_id: false,
          chapter_id: false,
        }}
        updateItemInline={async () => {}}
        numLoadingRows={3}
      />
    </div>
  );
}
