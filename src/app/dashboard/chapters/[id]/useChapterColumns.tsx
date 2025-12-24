import { arrayIncludesFilter } from '@/app/lib/utils';
import { FilterType, PodficStatus } from '@/app/types';
import { EditCell } from '@/app/ui/table/EditCell';
import { HeaderCell } from '@/app/ui/table/HeaderCell';
import { TableCell } from '@/app/ui/table/TableCell';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

export default function useChapterColumns() {
  const columnHelper = createColumnHelper<Chapter>();

  // hmmm should these be in multiple parts. to split up different bits.
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
      columnHelper.accessor('chapter_title', {
        header: 'Title',
        cell: TableCell,
        meta: {
          type: 'text',
        },
      }),
      columnHelper.accessor('chapter_number', {
        header: 'Number',
        cell: (props) => (
          <TableCell
            {...props}
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
    [columnHelper]
  );

  return { mainColumns };
}
