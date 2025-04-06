import tableStyles from '@/app/ui/table/table.module.css';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { TableCell } from './TableCell';
import { CircularProgress } from '@mui/material';

// TODO: should be able to pull in resources from parent sometimes? also refresh itself. it should be using swr
// TODO: event & author handling as well, and isFull for podficId
// TODO: I think this is largely deprecated?? you want to use the additionalcontentrows thing instead and pull in prefetched data
export default function ResourceTable({ podficId = null, chapterId = null }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  const fetchResources = useCallback(async () => {
    console.log('fetchresources running');
    setResourcesLoading(true);
    try {
      // may need to work on return types....has extra field bc of the join
      let requestString = `/db/resources?`;
      if (podficId) requestString = requestString + `podfic_id=${podficId}`;
      else if (chapterId)
        requestString = requestString + `chapter_id=${chapterId}`;
      const response = await fetch(requestString);
      const data = await response.json();
      console.log({ data });
      setResources(data);
    } catch (e) {
      console.error('Error fetching resources:', e);
    } finally {
      setResourcesLoading(false);
    }
  }, [podficId, chapterId]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const columnHelper = createColumnHelper<Resource>();

  // yeah I should do a mapping of non-visible columns w/ their meta, that would be clearer
  const columns = [
    columnHelper.accessor('resource_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
      },
    }),
    columnHelper.accessor('resource_type', {
      header: 'Resource Type',
      cell: TableCell,
      meta: {
        type: 'string',
      },
    }),
    columnHelper.accessor('label', {
      header: 'Label',
      cell: TableCell,
      meta: {
        type: 'string',
      },
    }),
    columnHelper.accessor('link', {
      header: 'Link',
      cell: TableCell,
      meta: {
        type: 'link',
      },
    }),
    columnHelper.accessor('notes', {
      header: 'Notes',
      cell: TableCell,
      meta: {
        type: 'text',
      },
    }),
  ];

  const table = useReactTable({
    data: resources,
    columns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: {
        resource_id: false,
      },
    },
    meta: {
      editingRowId: null,
      setEditingRowId: () => {},
    },
  });

  // TODO: loading state in tbody instead. also it isn't showing headers this is fine
  // TODO: row groups for resource type?
  return (
    <div>
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
          {resourcesLoading && <CircularProgress />}
          {table.getRowModel().rows.map((row) => (
            <Fragment key={row.id}>
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
