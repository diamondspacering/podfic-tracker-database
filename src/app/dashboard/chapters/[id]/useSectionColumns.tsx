import {
  arrayIncludesFilter,
  formatTableDate,
  useColorScale,
  useLengthColorScale,
} from '@/app/lib/utils';
import { FilterType, PodficStatus } from '@/app/types';
import { TableCell } from '@/app/ui/table/TableCell';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

interface UseSectionColumnsProps {
  sections: Section[] | (Section & Chapter)[];
  editingRowId?: string | null;
}

/**
 * Returns columns for sections to use in table.
 * Columns for section_id, number, text_link, wordcount, length, raw_length, posted_date, and ao3_link
 * @param {UseSectionColumnsProps} param0
 * @param {Section[] | (Section & Chapter)[]} param0.sections - section data
 * @param {string | null} [param0.editingRowId] - id of row currently being edited
 */
export default function useSectionColumns({
  sections,
  editingRowId = '',
}: UseSectionColumnsProps) {
  const columnHelper = createColumnHelper<Section>();

  // TODO: color scale is fucked
  const rawColorScale = useLengthColorScale(sections, 'raw_length');
  const lengthColorScale = useLengthColorScale(sections, 'length');
  const wordcountColorScale = useColorScale(sections, 'wordcount');

  const titleColumn = useMemo(
    () => [
      columnHelper.accessor('title', {
        header: 'Title',
        cell: TableCell,
        meta: {
          type: 'string',
        },
      }),
    ],
    [columnHelper]
  );

  const metaColumns = useMemo(
    () => [
      columnHelper.accessor('section_id', {
        header: 'ID',
        cell: TableCell,
        meta: {
          type: 'number',
          immutable: true,
          hidden: true,
        },
      }),
      columnHelper.accessor('number', {
        header: 'Number',
        cell: TableCell,
        meta: {
          type: 'number',
          immutable: true,
          hidden: true,
        },
      }),
      columnHelper.accessor('text_link', {
        header: 'Link',
        cell: TableCell,
        meta: {
          type: 'link',
        },
      }),
      columnHelper.accessor('wordcount', {
        header: 'Wordcount',
        cell: (props) => (
          <TableCell
            {...props}
            extraFieldParams={{
              sx: {
                width: '80px',
              },
            }}
          />
        ),
        meta: {
          type: 'colorScale',
          colorScale: wordcountColorScale,
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
      columnHelper.accessor('raw_length', {
        header: 'Raw Length',
        cell: TableCell,
        meta: {
          type: 'length',
          colorScale: rawColorScale,
          immutable: true,
        },
      }),
    ],
    [columnHelper, lengthColorScale, rawColorScale, wordcountColorScale]
  );

  const postingColumns = useMemo(
    () => [
      columnHelper.accessor('status', {
        header: 'Status',
        cell: TableCell,
        meta: {
          type: 'status',
          filterType: FilterType.STATUS,
          options: Object.values(PodficStatus).map((status) => ({
            label: status,
            value: status,
          })),
          columnName: 'Status',
        },
        filterFn: arrayIncludesFilter,
      }),
      columnHelper.accessor('posted_date', {
        header: 'Posted',
        cell: ({ getValue, row, ...rest }) => (
          <TableCell
            getValue={() => {
              return formatTableDate(getValue(), editingRowId === row.id);
              // const currentVal = getValue();
              // if (editingRowId === row.id)
              //   return currentVal
              //     ? formatDateString(
              //         new Date(
              //           currentVal.includes('T')
              //             ? currentVal
              //             : `${currentVal}T00:00:00`
              //         )
              //       )
              //     : '';
              // return currentVal
              //   ? formatDateStringMonthFirst(new Date(currentVal))
              //   : '';
            }}
            row={row}
            {...rest}
          />
        ),
        meta: {
          type: 'date',
        },
      }),
      columnHelper.accessor('ao3_link', {
        header: 'Link',
        cell: TableCell,
        meta: {
          type: 'link',
          selectable: false,
        },
      }),
    ],
    [columnHelper, editingRowId]
  );

  return { titleColumn, metaColumns, postingColumns };
}
