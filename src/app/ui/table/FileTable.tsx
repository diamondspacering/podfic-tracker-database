import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import { TableCell } from './TableCell';
import tableStyles from '@/app/ui/table/table.module.css';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import FileDialog from '@/app/forms/podfic/file-dialog';
import { getLengthText } from '@/app/lib/format';

export default function FileTable({
  podficId,
  podficTitle,
  chapterId,
  lengthColorScale,
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState(null);

  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(-1);

  const fetchFiles = useCallback(async () => {
    const response = await fetch(
      `/db/files?podfic_id=${podficId}&chapter_id=${chapterId}&with_chapters=false`
    );
    const data = await response.json();
    console.log({ data });
    setFiles(data);
  }, [podficId, chapterId]);

  // possibly just needs the fetchfiles dependency
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, podficId, chapterId]);

  const deleteFile = useCallback(async () => {
    // TODO: will be needed w/ swr
    // const fileObject = files?.find((file) => file.file_id === selectedFile);
    await fetch(`/db/files/${selectedFile}`, {
      method: 'DELETE',
    });
    await fetchFiles();
    setDeleteConfirmDialogOpen(false);
  }, [selectedFile, fetchFiles]);

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
    columnHelper.accessor('chapter_id', {
      header: 'ID',
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
    // TODO: sideways headers like google sheets??
    // TODO: fix links not being offset
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
    // TODO: maybe embed if present? other links? linklist type?
    columnHelper.display({
      id: 'edit',
      header: 'Edit',
      cell: (props) => (
        <IconButton
          onClick={() => {
            setFileDialogOpen(true);
            setEditingFile(props.row.original);
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

  const table = useReactTable({
    data: files,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: {
        file_id: false,
        podfic_id: false,
        chapter_id: false,
      },
    },
    meta: {
      editingRowId: null,
      setEditingRowId: () => {},
    },
  });

  // TODO: should this be passed the podfic title?
  return (
    <div>
      <FileDialog
        isOpen={fileDialogOpen}
        onClose={() => setFileDialogOpen(false)}
        submitCallback={async () => {
          await fetchFiles();
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
      {filesLoading ? (
        <CircularProgress />
      ) : (
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
              <>
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              </>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
