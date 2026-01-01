'use client';

import { useAuthors } from '@/app/lib/swrLoaders';
import AddMenu from '@/app/ui/AddMenu';
import { EditCell } from '@/app/ui/table/EditCell';
import { TableCell } from '@/app/ui/table/TableCell';
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table';
import { useState } from 'react';
import { mutate } from 'swr';
import { createUpdateAuthor } from '@/app/lib/updaters';
import { socialMedia } from '@/app/lib/dataGeneral';
import AdditionalContentRows from '@/app/ui/table/AdditionalContentRows';
import {
  arrayIncludesFilter,
  dateFilter,
  formatTableDate,
} from '@/app/lib/utils';
import { HeaderCell } from '@/app/ui/table/HeaderCell';
import { FilterType } from '@/app/types';
import CustomTable from '@/app/ui/table/CustomTable';

export default function AuthorTable() {
  const { authors, isLoading } = useAuthors();

  const [editingRowId, setEditingRowId] = useState<string | null>(null);

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
        type: 'text',
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
    // TODO: add filtering based on child permission statuses as well
    // hmmmm cause we might want to filter authors based on like Currently Ghosting lol
    // latest permission ask or smth??
    columnHelper.accessor('permission_status', {
      header: (props) => <HeaderCell text='Permission' {...props} />,
      cell: TableCell,
      meta: {
        type: 'status',
        statusType: 'author_permission',
        filterType: FilterType.AUTHOR_PERMISSION,
        columName: 'Permission',
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('asked_date', {
      header: (props) => <HeaderCell text='Asked Date' {...props} />,
      cell: ({ getValue, ...rest }) => (
        <TableCell
          getValue={() =>
            formatTableDate(getValue(), editingRowId === rest.row.id)
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
            formatTableDate(getValue(), editingRowId === rest.row.id)
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
          options={['resource', 'note', 'permission_ask']}
        />
      ),
    }),
  ];

  return (
    <div>
      <CustomTable
        isLoading={isLoading}
        data={authors}
        columns={columns}
        rowKey={'author_id'}
        showRowCount
        editingRowId={editingRowId}
        setEditingRowId={setEditingRowId}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        showClearFilters
        showResetDefaultFilters
        globalFilterFn={(row, _columnId, filterValue) => {
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
          const resourceText = row.original.resources?.reduce(
            (acc, resource) => {
              return (
                acc +
                ';' +
                resource.label +
                ';' +
                resource.link +
                ';' +
                resource.notes
              );
            },
            ''
          );
          if (resourceText.toLowerCase().includes(filter)) return true;
          return false;
        }}
        columnVisibility={columns.reduce((acc, column) => {
          if ((column.meta as any)?.hidden && (column as any)?.accessorKey) {
            acc[(column as any).accessorKey as string] = false;
          }
          return acc;
        }, {})}
        rowsAlwaysExpanded
        getExpandedContent={(row) => (
          <AdditionalContentRows
            width={row.getAllCells().length}
            notes={row.original.notes ?? []}
            resources={row.original.resources ?? []}
            permissionAsks={row.original.permission_asks ?? []}
            author_id={row.original.author_id}
            submitCallback={async () => {
              await mutate('/db/authors');
            }}
          />
        )}
        updateItemInline={async (editingRow) => {
          await updateAuthor(editingRow);
        }}
      />
      <br />
      <br />
      <br />
    </div>
  );
}
