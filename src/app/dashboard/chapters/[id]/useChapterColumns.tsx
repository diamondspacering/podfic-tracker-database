import { TableCell } from '@/app/ui/table/TableCell';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

export default function useChapterColumns({ longChapterNumber = false }) {
  const columnHelper = createColumnHelper<Chapter>();

  const mainColumns = useMemo(
    () => [
      columnHelper.accessor('chapter_id', {
        header: 'ID',
        cell: TableCell,
        meta: {
          type: 'number',
          immutable: true,
          hidden: true,
        },
      }),
      columnHelper.accessor('podfic_id', {
        header: 'Podfic ID',
        cell: TableCell,
        meta: {
          type: 'number',
          immutable: true,
          hidden: true,
        },
      }),
      columnHelper.accessor('chapter_number', {
        header: 'Number',
        cell: ({ getValue, ...rest }) => (
          <TableCell
            getValue={() =>
              longChapterNumber ? `Chapter ${getValue()}` : getValue()
            }
            {...rest}
            extraFieldParams={{
              sx: {
                width: '50px',
              },
            }}
          />
        ),
        meta: {
          type: 'number',
        },
      }),
      columnHelper.accessor('chapter_title', {
        header: 'Title',
        cell: TableCell,
        meta: {
          type: 'text',
        },
      }),
      // columnHelper.accessor('link', {
      //   header: 'Link',
      //   cell: TableCell,
      //   meta: {
      //     type: 'link',
      //   },
      // }),
      // no wordcount - it's a combined one
      // no length or raw length
      // TODO: is status applicable or only on sections?
      // columnHelper.display({
      //   id: 'edit',
      //   cell: EditCell,
      // }),
      // TODO: should there be an add related that adds to all sections....?
    ],
    [columnHelper, longChapterNumber]
  );

  return { mainColumns };
}
