import { createColumnHelper } from '@tanstack/react-table';
import { TableCell } from './TableCell';
import CustomTable from './CustomTable';
import { useResources } from '@/app/lib/swrLoaders';

// TODO: should be able to pull in resources from parent sometimes? also refresh itself. it should be using swr
// TODO: event & author handling as well, and isFull for podficId
// TODO: I think this is largely deprecated?? you want to use the additionalcontentrows thing instead and pull in prefetched data
export default function ResourceTable({ podficId = null, chapterId = null }) {
  const { resources, isLoading } = useResources({ podficId, chapterId });

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

  // TODO: row groups for resource type?
  return (
    <CustomTable
      isLoading={isLoading}
      data={resources}
      columns={columns}
      columnVisibility={{ resource_id: false }}
      rowKey='resource_id'
      editingRowId={null}
      setEditingRowId={() => {}}
      columnFilters={[]}
      setColumnFilters={() => {}}
      updateItemInline={async () => {}}
    />
  );
}
