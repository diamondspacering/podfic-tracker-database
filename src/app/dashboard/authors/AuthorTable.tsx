'use client';

import { useAuthors } from '@/app/lib/swrLoaders';
import AddMenu from '@/app/ui/AddMenu';
import { EditCell } from '@/app/ui/table/EditCell';
import { TableCell } from '@/app/ui/table/TableCell';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Fragment, useState } from 'react';
import tableStyles from '@/app/ui/table/table.module.css';
import { mutate } from 'swr';
import { createUpdateAuthor } from '@/app/lib/updaters';
import { socialMedia } from '@/app/lib/dataGeneral';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { Close } from '@mui/icons-material';
import AdditionalContentRows from '@/app/ui/table/AdditionalContentRows';
import {
  arrayIncludesFilter,
  dateFilter,
  formatTableDate,
} from '@/app/lib/utils';
import { HeaderCell } from '@/app/ui/table/HeaderCell';
import { FilterType } from '@/app/types';
import { resetAllColumnsToDefault } from '../../lib/defaultColumnFilters';

export default function AuthorTable() {
  const { authors } = useAuthors();

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<Author | null>(null);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const updateAuthor = async (author: Author) => {
    try {
      await createUpdateAuthor(author);
      await mutate('/db/authors');
      setEditingRowId(null);
    } catch (e) {
      console.error('Error updating author:', e);
    }
  };

  const columnHelper = createColumnHelper<Author>();

  const columns = [
    columnHelper.accessor('author_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: 'true',
        hidden: true,
      },
    }),
    columnHelper.accessor('username', {
      header: (props) => <HeaderCell text='Username' {...props} />,
      cell: TableCell,
      meta: {
        type: 'string',
        filterType: FilterType.STRING,
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('ao3', {
      header: 'AO3',
      cell: TableCell,
      meta: {
        type: 'link',
      },
    }),
    columnHelper.accessor('primary_social_media', {
      header: 'Primary SM',
      cell: TableCell,
      meta: {
        type: 'select',
        label: 'SM',
        width: '130px',
        options: socialMedia.map((sm) => ({ label: sm, value: sm })),
      },
    }),
    columnHelper.accessor('permission_ask', {
      header: 'Ask',
      cell: TableCell,
      meta: {
        type: 'link',
      },
    }),
    columnHelper.accessor('permission_status', {
      header: (props) => <HeaderCell text='Permission' {...props} />,
      // header: 'Permission',
      cell: TableCell,
      meta: {
        type: 'status',
        statusType: 'permission',
        filterType: FilterType.PERMISSION,
        columName: 'Permission',
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('asked_date', {
      header: (props) => <HeaderCell text='Asked Date' {...props} />,
      cell: ({ getValue, ...rest }) => (
        <TableCell
          getValue={() =>
            formatTableDate(
              getValue(),
              editingRowId === rest.row.id,
              editingRow?.asked_date
            )
          }
          {...rest}
        />
      ),
      meta: {
        type: 'date',
        filterType: FilterType.DATE,
      },
    }),
    columnHelper.accessor('permission_date', {
      header: (props) => <HeaderCell text='Permission Date' {...props} />,
      cell: ({ getValue, ...rest }) => (
        <TableCell
          getValue={() =>
            formatTableDate(
              getValue(),
              editingRowId === rest.row.id,
              editingRow?.permission_date
            )
          }
          {...rest}
        />
      ),
      meta: {
        type: 'date',
        filterType: FilterType.DATE,
      },
      filterFn: dateFilter,
    }),
    columnHelper.display({
      id: 'edit',
      cell: EditCell,
    }),
    columnHelper.display({
      id: 'add-related',
      cell: (props) => (
        <AddMenu
          authorId={props.row.getValue('author_id')}
          options={['resource', 'note']}
        />
      ),
    }),
  ];

  // TODO: include option for viewing works by that author? link to podfic table & set filter?
  const table = useReactTable({
    data: authors,
    columns,
    getCoreRowModel: getCoreRowModel<Author>(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.author_id?.toString(),
    enableMultiRowSelection: false,
    enableRowSelection: (row) => editingRowId !== row.id,
    globalFilterFn: (row, _columnId, filterValue) => {
      const filter = filterValue.toLowerCase();
      if (
        row.original.username?.toLowerCase().includes(filter) ||
        row.original.primary_social_media?.toLowerCase().includes(filter)
      )
        return true;
      const noteText = row.original.notes?.reduce((acc, note) => {
        return acc + ';' + note.label + ';' + note.value;
      }, '');
      if (noteText.toLowerCase().includes(filter)) return true;
      const resourceText = row.original.resources?.reduce((acc, resource) => {
        return (
          acc +
          ';' +
          resource.label +
          ';' +
          resource.link +
          ';' +
          resource.notes
        );
      }, '');
      if (resourceText.toLowerCase().includes(filter)) return true;
      return false;
    },
    initialState: {
      columnVisibility: columns.reduce((acc, column) => {
        if ((column.meta as any)?.hidden && (column as any)?.accessorKey) {
          acc[(column as any).accessorKey as string] = false;
        }
        return acc;
      }, {}),
    },
    state: {
      columnFilters: columnFilters,
    },
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters(updaterOrValue);
    },
    meta: {
      columnFilters,
      setColumnFilters,
      filterActivated: (column, filterType) => {
        if (!columnFilters.some((f) => f.id === column.id)) return false;
        if (filterType === FilterType.STATUS) {
          return !Object.values(PodficStatus).every((f) =>
            (column.getFilterValue() ?? []).includes(f)
          );
        }
        if (filterType === FilterType.PERMISSION) {
          return !Object.values(PermissionStatus).every((f) =>
            (column.getFilterValue() ?? []).includes(f)
          );
        }
        if (filterType === FilterType.TYPE) {
          return !Array.from(column.getFacetedUniqueValues().keys()).every(
            (f) => (column.getFilterValue() ?? []).includes(f)
          );
        }
        // so should list as activated if there's non-truthy keys in there
        if (filterType === FilterType.DATE) {
          return !!column.getFilterValue() &&
            !!Object.keys(column.getFilterValue()).length &&
            !!Object.values(column.getFilterValue()).some((f) => !!f) &&
            column.getFilterValue().range
            ? !!Object.keys(column.getFilterValue().range).length &&
                !!Object.values(column.getFilterValue().range).some((f) => !!f)
            : true;
        }
      },
      editingRowId,
      setEditingRowId,
      editingRow,
      setEditingRow,
      updateData: (rowId, columnId, value) => {
        setEditingRow((prev) => (prev ? { ...prev, [columnId]: value } : null));
      },
      revertRow: () => {
        setEditingRow(null);
      },
      submitRow: async () => {
        await updateAuthor(editingRow as Author);
      },
    },
  });

  return (
    <div>
      <TextField
        size='small'
        placeholder='Search...'
        value={table.getState().globalFilter}
        onChange={(e) => table.setGlobalFilter(e.target.value)}
        sx={{
          width: 'fit-content',
        }}
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
      <b>Displaying {table.getFilteredRowModel().rows.length}</b>
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
              <AdditionalContentRows
                width={row.getAllCells().length}
                notes={row.original.notes ?? []}
                resources={row.original.resources ?? []}
                author_id={row.original.author_id}
                submitCallback={async () => {
                  await mutate('/db/authors');
                }}
              />
            </Fragment>
          ))}
        </tbody>
      </table>
      <br />
      <br />
      <br />
    </div>
  );
}
