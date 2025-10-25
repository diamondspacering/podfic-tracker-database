'use client';

import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Mic,
} from '@mui/icons-material';
import { Button, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { TableCell } from '@/app/ui/table/TableCell';
import { EditCell } from '@/app/ui/table/EditCell';
import AddMenu from '@/app/ui/AddMenu';
import FileTable from '@/app/ui/table/FileTable';
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
import CustomTable from '@/app/ui/table/CustomTable';

export default function ChapterTable({ podficId, podficTitle }) {
  const { chapters, isLoading } = useChaptersForPodfic(podficId);
  const [filesExpanded, setFilesExpanded] = useState(false);

  const pathname = usePathname();

  const rawColorScale = useLengthColorScale(chapters, 'raw_length');
  const lengthColorScale = useLengthColorScale(chapters, 'length');

  const wordcountColorScale = useColorScale(chapters, 'wordcount');

  const [columnVisibility, setColumnVisibility] = useState({
    chapter_id: false,
    podfic_id: false,
  });

  const columnHelper = createColumnHelper<Chapter>();

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
      <CustomTable
        isLoading={isLoading}
        data={chapters}
        columns={columns}
        rowKey='chapter_id'
        columnFilters={[]}
        setColumnFilters={() => {}}
        showColumnVisibility
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        editingRowId={editingRowId}
        setEditingRowId={setEditingRowId}
        updateItemInline={async (chapter) => await updateChapter(chapter)}
        showRowCount
        rowCanExpand
        getExpandedContent={(row) => (
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
            <AdditionalContentRows
              width={row.getVisibleCells().length}
              notes={row.original.notes ?? []}
              resources={row.original.resources ?? []}
              podfic_id={row.original.podfic_id}
              chapter_id={row.original.chapter_id}
            />
          </>
        )}
      />
    </div>
  );
}
