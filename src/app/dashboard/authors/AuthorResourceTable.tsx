import { resourceTypes } from '@/app/lib/dataGeneral';
import { TableCell } from '@/app/ui/table/TableCell';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import tableStyles from '@/app/ui/table/table.module.css';

export default function AuthorResourceTable({
  resources,
  notes,
}: {
  resources: Resource[];
  notes: Note[];
}) {
  const resourceColumnHelper = createColumnHelper<Resource>();
  const resourceColumns = [
    resourceColumnHelper.accessor('resource_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
      },
    }),
    resourceColumnHelper.accessor('label', {
      header: 'Label',
      cell: TableCell,
      meta: {
        type: 'string',
      },
    }),
    resourceColumnHelper.accessor('resource_type', {
      header: 'Type',
      cell: TableCell,
      meta: {
        type: 'select',
        options: resourceTypes.map((type) => ({ label: type, value: type })),
      },
    }),
    resourceColumnHelper.accessor('notes', {
      header: 'Notes',
      cell: TableCell,
      meta: {
        type: 'text-block',
      },
    }),
  ];

  const resourceTable = useReactTable({
    data: resources,
    columns: resourceColumns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: resourceColumns.reduce((acc, column) => {
        acc[column.id] = (column.meta as any).hidden;
        return acc;
      }, {}),
    },
  });

  const noteColumnHelper = createColumnHelper<Note>();

  const noteColumns = [
    noteColumnHelper.accessor('note_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
      },
    }),
    noteColumnHelper.accessor('label', {
      header: 'Label',
      cell: TableCell,
      meta: {
        type: 'string',
      },
    }),
    noteColumnHelper.accessor('value', {
      header: 'Value',
      cell: TableCell,
      meta: {
        type: 'text-block',
      },
    }),
  ];

  const noteTable = useReactTable({
    data: notes,
    columns: noteColumns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: noteColumns.reduce((acc, column) => {
        acc[column.id] = (column.meta as any).hidden;
        return acc;
      }, {}),
    },
  });

  return (
    <div
      style={{
        paddingLeft: '30px',
      }}
    >
      {[resourceTable, noteTable].map((table, index) =>
        (index === 0 && resources.length === 0) ||
        (index === 1 && notes.length === 0) ? (
          <></>
        ) : (
          <table key={index} className={tableStyles.table}>
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
    </div>
  );
}
