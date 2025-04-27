'use client';

import { formatDateString, formatDateStringMonthFirst } from '@/app/lib/format';
import { getDefaultLength, PodficStatus } from '@/app/types';
import {
  ArrowRight,
  Check,
  Close,
  Edit,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Mic,
} from '@mui/icons-material';
import { Button, IconButton, Typography } from '@mui/material';
import ColorScale from 'color-scales';
import styles from '@/app/dashboard/dashboard.module.css';
import { Fragment, useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import tableStyles from '@/app/ui/table/table.module.css';
import { TableCell } from '@/app/ui/table/TableCell';
import { EditCell } from '@/app/ui/table/EditCell';
import AddMenu from '@/app/ui/AddMenu';
import FileTable from '@/app/ui/table/FileTable';
import ResourceTable from '@/app/ui/table/ResourceTable';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { mutate } from 'swr';
import { useChaptersForPodfic } from '@/app/lib/swrLoaders';
import AdditionalContentRows from '@/app/ui/table/AdditionalContentRows';
import {
  formatTableDate,
  useColorScale,
  useLengthColorScale,
} from '@/app/lib/utils';
import { getLengthValue } from '@/app/lib/lengthHelpers';

// TODO: general chapter table for all chapters?
export default function ChapterTable({ podficId, podficTitle }) {
  const { chapters: originalChapters } = useChaptersForPodfic(podficId);
  // TODO: individual files and resources expanded per chapter
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);

  const pathname = usePathname();

  const rawColorScale = useLengthColorScale(originalChapters, 'raw_length');
  const lengthColorScale = useLengthColorScale(originalChapters, 'length');

  // TODO: wordcount global color scale??
  const wordcountColorScale = useColorScale(originalChapters, 'wordcount');

  const columnHelper = createColumnHelper<Chapter>();

  // TODO: should these be defined in a separate file?
  // TODO: column show/hide like podfic table
  const columns = [
    columnHelper.accessor('chapter_id', {
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
    columnHelper.display({
      id: 'expand',
      cell: (props) => (
        <IconButton
          style={{ padding: '0px' }}
          onClick={(e) => {
            e.stopPropagation();
            setFilesExpanded(!props.row.getIsExpanded());
            setResourcesExpanded(!props.row.getIsExpanded());
            props.row.toggleExpanded();
          }}
        >
          {props.row.getIsExpanded() ? (
            <KeyboardArrowDown />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
      ),
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
    columnHelper.accessor('link', {
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
    columnHelper.accessor('status', {
      header: 'Status',
      cell: TableCell,
      meta: {
        type: 'status',
      },
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
    columnHelper.display({
      id: 'edit',
      cell: EditCell,
    }),
    columnHelper.display({
      id: 'add-related',
      cell: (props) => (
        <AddMenu
          podficTitle={podficTitle}
          podficId={props.row.getValue('podfic_id')}
          chapterId={props.row.getValue('chapter_id')}
          length={props.row.getValue('length')}
          options={['file', 'resource', 'note']}
        />
      ),
    }),
    columnHelper.display({
      id: 'add-recording-session',
      cell: (props) => (
        <Link
          href={`/forms/recording-session/new?podfic_id=${props.row.getValue(
            'podfic_id'
          )}&chapter_id=${props.row.getValue(
            'chapter_id'
          )}&return_url=${pathname}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant='contained'
            style={{
              padding: '0px',
            }}
          >
            <Mic sx={{ padding: '0px' }} />
          </Button>
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'generate-html',
      cell: (props) => (
        <Link
          href={`/dashboard/html?podfic_id=${props.row.getValue(
            'podfic_id'
          )}&chapter_id=${props.row.getValue('chapter_id')}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant='contained'
            style={{
              padding: '0px',
            }}
          >
            HTML
          </Button>
        </Link>
      ),
    }),
  ];

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<Chapter | null>(null);

  const chapterData = useMemo(
    () =>
      originalChapters.map((chapter) =>
        editingRow?.chapter_id === chapter.chapter_id ? editingRow : chapter
      ),
    [editingRow, originalChapters]
  );

  const table = useReactTable({
    data: chapterData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: (row) => row.chapter_id?.toString(),
    enableMultiRowSelection: false,
    enableRowSelection: (row) => editingRowId !== row.id,
    initialState: {
      columnVisibility: {
        chapter_id: false,
        podfic_id: false,
      },
    },
    meta: {
      editingRowId,
      setEditingRowId,
      editingRow,
      setEditingRow,
      updateData: (_rowId, columnId, value) => {
        setEditingRow((prev) => (prev ? { ...prev, [columnId]: value } : null));
      },
      revertRow: () => {
        setEditingRow(null);
      },
      submitRow: async () => {
        await updateChapter(editingRow);
      },
    },
  });

  const updateChapter = async (chapter: Chapter) => {
    try {
      await fetch(`/db/chapters/${chapter.chapter_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapter),
      });
      await mutate(`/db/chapters/${podficId}`);
      setEditingRowId(null);
    } catch (e) {
      console.error('Error updating chapter:', e);
    }
  };

  return (
    <div
      style={{
        overflowX: 'scroll',
      }}
    >
      <Typography variant='h2'>Chapters for {podficTitle}</Typography>
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
              {/* TODO: use additionalcontentrows */}
              {row.getIsExpanded() && (
                <>
                  <tr key='files-expand'>
                    <td
                      key='1'
                      colSpan={row.getAllCells().length}
                      style={{
                        paddingLeft: '30px',
                      }}
                    >
                      <span>
                        <IconButton
                          style={{
                            padding: '0px',
                          }}
                          onClick={() => setFilesExpanded((prev) => !prev)}
                        >
                          {filesExpanded ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowRight />
                          )}
                        </IconButton>
                        Files
                      </span>
                    </td>
                  </tr>
                  {filesExpanded && (
                    <tr key='files-expanded'>
                      <td
                        key='2'
                        colSpan={row.getAllCells().length}
                        style={{
                          paddingLeft: '60px',
                        }}
                      >
                        <FileTable
                          podficId={row.getValue('podfic_id')}
                          podficTitle={podficTitle}
                          chapterId={row.getValue('chapter_id')}
                          lengthColorScale={lengthColorScale}
                        />
                      </td>
                    </tr>
                  )}
                  {/* TODO: get stuff correctly for that */}
                  {/* <AdditionalContentRows
                    width={row.getVisibleCells().length}
                    // TODO: pull in notes
                    // notes={row.original.notes ?? []}
                    resources={row.original.re}
                  /> */}
                  <tr key='resources-expand'>
                    <td
                      key='1'
                      colSpan={row.getAllCells().length}
                      style={{
                        paddingLeft: '30px',
                      }}
                    >
                      <span>
                        <IconButton
                          style={{
                            padding: '0px',
                          }}
                          onClick={() => setResourcesExpanded((prev) => !prev)}
                        >
                          {resourcesExpanded ? (
                            <KeyboardArrowDown />
                          ) : (
                            <KeyboardArrowRight />
                          )}
                        </IconButton>
                        Resources
                      </span>
                    </td>
                  </tr>
                  {resourcesExpanded && (
                    <tr key='resources-expanded'>
                      <td
                        key='2'
                        colSpan={row.getAllCells().length}
                        style={{
                          paddingLeft: '60px',
                        }}
                      >
                        <ResourceTable chapterId={row.getValue('chapter_id')} />
                      </td>
                    </tr>
                  )}
                </>
              )}
            </Fragment>
          ))}
        </tbody>
        {/* TODO: summary row, similar to podfic table */}
      </table>
    </div>
  );
}
