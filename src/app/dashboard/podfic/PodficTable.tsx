'use client';

import { getLengthText } from '@/app/lib/format';
import {
  FilterType,
  getDefaultLength,
  PodficStatus,
  PodficType,
} from '@/app/types';
import AddMenu from '@/app/ui/AddMenu';
import { TableCell } from '@/app/ui/table/TableCell';
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table';
import ColorScale from 'color-scales';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/app/dashboard/dashboard.module.css';
import tableStyles from '@/app/ui/table/table.module.css';
import { updatePodficMinified } from '@/app/lib/updaters';
import Link from 'next/link';
import { Button, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Mic,
  OpenInNew,
} from '@mui/icons-material';
import { sourceCodePro } from '@/app/fonts/fonts';
import { HeaderCell } from '@/app/ui/table/HeaderCell';
import {
  arrayIncludesFilter,
  dateFilter,
  formatTableDate,
} from '@/app/lib/utils';
import { usePersistentState } from '@/app/lib/utilsFrontend';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { usePodficsFull } from '@/app/lib/swrLoaders';
import { mutate } from 'swr';
import AdditionalContentRows from '@/app/ui/table/AdditionalContentRows';
import FileTable from '@/app/ui/table/FileTable';
import { EditCell } from '@/app/ui/table/EditCell';
import RecordingSessionTable from '@/app/ui/table/RecordingSessionTable';
import { addLengths, getLengthValue } from '@/app/lib/lengthHelpers';
import CustomTable from '@/app/ui/table/CustomTable';
import ExternalLink from '@/app/ui/ExternalLink';

export default function PodficTable() {
  const searchParams = useSearchParams();
  const missingAALinks = searchParams.get('missing_aa_links') === 'true';
  const { podfics, isLoading } = usePodficsFull({ missingAALinks });

  const router = useRouter();

  const pathname = usePathname();

  const [filesExpanded, setFilesExpanded] = useState<number[]>([]);
  const [resourcesExpanded, setResourcesExpanded] = useState<number[]>([]);
  const [recordingSessionsExpanded, setRecordingSessionsExpanded] = useState<
    number[]
  >([]);

  const lengthColorScale = new ColorScale(0, 3600, ['#ffffff', '#4285f4']);
  const wordcountColorScale = new ColorScale(0, 150000, ['#ffffff', '#4285f4']);

  const columnHelper = createColumnHelper<Podfic & Work & Fandom & Event>();
  const [columnFilters, setColumnFilters] =
    usePersistentState<ColumnFiltersState>('PODFIC_TABLE_COLUMN_FILTERS', [
      {
        id: 'status',
        value: Object.values(PodficStatus).filter(
          (status) => status !== PodficStatus.PLANNING
        ),
      },
    ]);
  useEffect(() => console.log({ columnFilters }), [columnFilters]);

  const includeMultivoice = useMemo(() => {
    const typeFilter = columnFilters.find((filter) => filter?.id === 'type');
    if (!typeFilter || !typeFilter.value) return false;
    return (typeFilter.value as Array<string>).includes('multivoice');
  }, [columnFilters]);

  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const columns = [
    columnHelper.accessor('podfic_id', {
      header: 'ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
        columnName: 'ID',
      },
    }),
    columnHelper.accessor('work_id', {
      header: 'Work ID',
      cell: TableCell,
      meta: {
        type: 'number',
        immutable: true,
        hidden: true,
        columName: 'Work ID',
      },
    }),
    columnHelper.display({
      id: 'expand',
      cell: (props) => (
        <IconButton
          style={{ padding: '0px' }}
          onClick={(e) => {
            // TODO: fill out this function, do the putting indices in an array or whatever
            const isExpanded = props.row.getIsExpanded();
            const isSelected = props.row.getIsSelected();
            // TODO: this still doesn't work quite the way I want it to I think
            // maybe select it when editing? and don't allow other things to be selected?
            // if it's expanded and deselected, don't select
            // if it's not expanded and selected, don't deselect
            if (isExpanded && !isSelected) e.stopPropagation();
            if (!isExpanded && isSelected) e.stopPropagation();
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
      enableHiding: false,
    }),
    columnHelper.display({
      id: 'number',
      cell: (props) => (
        <span className={`${sourceCodePro.className} ${tableStyles.smallText}`}>
          {props.row.index + 1}
        </span>
      ),
      enableColumnFilter: false,
      meta: {
        columnName: '#',
      },
    }),
    columnHelper.accessor('title', {
      header: 'Title',
      cell: ({ getValue, row, ...rest }) => (
        <TableCell
          getValue={() =>
            row.original.nickname ? row.original.nickname : getValue()
          }
          row={row}
          {...rest}
        />
      ),
      meta: {
        type: 'text',
        maxWidth: '300px',
        immutable: true,
        columnName: 'Title',
      },
    }),
    columnHelper.accessor('link', {
      header: 'Link',
      cell: TableCell,
      meta: {
        type: 'link',
        immutable: true,
      },
      enableHiding: false,
    }),
    columnHelper.accessor('username', {
      header: (props) => <HeaderCell text='Author' {...props} />,
      cell: TableCell,
      meta: {
        type: 'string',
        filterType: FilterType.STRING,
        columnName: 'Author',
        maxWidth: '150px',
        immutable: 'true',
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('permission_status', {
      header: (props) => <HeaderCell text='Perm' {...props} />,
      cell: TableCell,
      meta: {
        type: 'status',
        statusType: 'permission',
        filterType: FilterType.PERMISSION,
        columnName: 'Permission',
        immutable: true,
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('fandom_name', {
      header: (props) => <HeaderCell text='Fandom' {...props} />,
      cell: TableCell,
      meta: {
        type: 'autocomplete',
        filterType: FilterType.STRING,
        columnName: 'Fandom',
        immutable: true,
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('wordcount', {
      header: 'Wordcount',
      cell: TableCell,
      meta: {
        type: 'colorScale',
        colorScale: wordcountColorScale,
        immutable: true,
        columnName: 'Wordcount',
      },
      footer: ({ table }) => {
        const sum = table
          .getFilteredRowModel()
          .rows?.reduce(
            (acc, row) => acc + parseInt(row.getValue('wordcount') ?? '0'),
            0
          );
        return <span>{sum.toLocaleString()}</span>;
      },
    }),
    columnHelper.accessor('length', {
      header: 'Length',
      cell: TableCell,
      meta: {
        type: 'length',
        colorScale: lengthColorScale,
        // TODO: make that actually work
        // immutable if it's chaptered
        // immutable: (rowId: string) =>
        //   !podfics.find((p) => p.podfic_id === parseInt(rowId))?.chapters
        //     ?.length 1 > 1,
        columnName: 'Length',
      },
      footer: ({ table }) => {
        const sum = table
          .getFilteredRowModel()
          .rows?.reduce(
            (acc, row) => addLengths(acc, row.getValue('length')),
            getDefaultLength()
          );
        return <span>{getLengthText(sum)}</span>;
      },
    }),
    columnHelper.accessor('plain_length', {
      header: 'Plain Length',
      cell: TableCell,
      meta: {
        type: 'length',
        colorScale: lengthColorScale,
        immutable: true,
        columnName: 'Plain Length',
      },
      footer: ({ table }) => {
        const sum = table
          .getFilteredRowModel()
          .rows?.reduce(
            (acc, row) => addLengths(acc, row.getValue('plain_length')),
            getDefaultLength()
          );
        return <span>{getLengthText(sum)}</span>;
      },
    }),
    columnHelper.accessor('raw_length', {
      header: 'Raw Length',
      cell: TableCell,
      meta: {
        type: 'length',
        colorScale: lengthColorScale,
        immutable: true,
        columnName: 'Raw Length',
      },
      footer: ({ table }) => {
        const sum = table
          .getFilteredRowModel()
          .rows?.reduce(
            (acc, row) => addLengths(acc, row.getValue('raw_length')),
            getDefaultLength()
          );
        return <span>{getLengthText(sum)}</span>;
      },
    }),
    columnHelper.display({
      id: 'wpm',
      header: 'WPM',
      cell: (props) => {
        let value = null;
        if (
          !!props.row.getValue('wordcount') &&
          !!props.row.getValue('length')
        ) {
          value = Math.round(
            parseInt(props.row.getValue('wordcount')) /
              (props.row.getValue('plain_length')
                ? getLengthValue(props.row.getValue('plain_length')) / 60
                : getLengthValue(props.row.getValue('length')) / 60)
          );
        }
        return <span>{value}</span>;
      },
      footer: ({ table }) => {
        const filteredRows = table
          .getFilteredRowModel()
          .rows?.filter(
            (row) => !!row.getValue('wordcount') && !!row.getValue('length')
          );
        const num = filteredRows?.length ? filteredRows.length : 1;
        const sum = filteredRows?.reduce(
          (acc, row) =>
            acc +
            Math.round(
              parseInt(row.getValue('wordcount')) /
                (getLengthValue(row.getValue('length')) / 60)
            ),
          0
        );
        return <span>{Math.round(sum / num)}</span>;
      },
    }),
    columnHelper.display({
      id: 'raw_wpm',
      header: 'Raw WPM',
      cell: (props) => {
        let value = null;
        if (
          !!props.row.getValue('wordcount') &&
          !!props.row.getValue('raw_length')
        ) {
          value = Math.round(
            parseInt(props.row.getValue('wordcount')) /
              (getLengthValue(props.row.getValue('raw_length')) / 60)
          );
        }
        return <span>{value}</span>;
      },
      footer: ({ table }) => {
        const filteredRows = table
          .getFilteredRowModel()
          .rows?.filter(
            (row) =>
              !!row.getValue('wordcount') &&
              !!row.getValue('raw_length') &&
              row.getValue('status') !== 'Recording'
          );
        const num = filteredRows?.length ? filteredRows.length : 1;
        const sum = filteredRows?.reduce(
          (acc, row) =>
            acc +
            Math.round(
              parseInt(row.getValue('wordcount')) /
                (getLengthValue(row.getValue('raw_length')) / 60)
            ),
          0
        );
        return <span>{Math.round(sum / num)}</span>;
      },
    }),
    columnHelper.accessor('event_name', {
      header: (props) => <HeaderCell text='Event' {...props} />,
      cell: TableCell,
      meta: {
        type: 'string',
        filterType: FilterType.STRING,
        columnName: 'Event',
        immutable: true,
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('type', {
      header: (props) => <HeaderCell text='Type' {...props} />,
      cell: TableCell,
      meta: {
        type: 'string',
        filterType: FilterType.TYPE,
        columnName: 'Type',
        immutable: true,
      },
      filterFn: arrayIncludesFilter,
    }),
    columnHelper.accessor('status', {
      header: (props) => <HeaderCell text='Status' {...props} />,
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
      header: (props) => <HeaderCell text='Posted' {...props} />,
      cell: ({ getValue, row, ...rest }) => (
        <TableCell
          getValue={() => {
            const currentVal =
              getValue() ?? row.original.posted_year?.toString();
            const isSingleYear = !getValue();
            if (isSingleYear && editingRowId !== row.id) return currentVal;
            else return formatTableDate(currentVal, editingRowId === row.id);
          }}
          row={row}
          {...rest}
        />
      ),
      meta: {
        type: 'date',
        filterType: FilterType.DATE,
        columnName: 'Posted',
      },
      filterFn: dateFilter,
    }),
    columnHelper.accessor('ao3_link', {
      header: 'Link',
      cell: TableCell,
      meta: {
        type: 'link',
        columnName: 'AO3 Link',
      },
    }),
    // TODO: add filtering based on chaptered status - toggle filter....? manually specified options? yeagh
    columnHelper.display({
      id: 'chapters',
      header: 'Chapters',
      cell: (props) =>
        props.row.original.chaptered ? (
          <Link
            href={`/dashboard/chapters/${props.row.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {`${
              props.row.original.chapters?.filter(
                (c) =>
                  c.status === PodficStatus.POSTED ||
                  c.status === PodficStatus.FINISHED ||
                  c.status === PodficStatus.POSTING
              ).length ?? '0'
            }/${props.row.original.chapter_count ?? '?'}`}
            &nbsp;
            <IconButton
              style={{
                padding: '0px',
              }}
            >
              <OpenInNew />
            </IconButton>
          </Link>
        ) : (
          ''
        ),
      meta: {
        columnName: 'Chapters',
      },
    }),
    columnHelper.display({
      id: 'edit-inline',
      cell: EditCell,
    }),
    columnHelper.display({
      id: 'edit-full',
      cell: (props) => (
        <Link
          href={`/forms/podfic/${props.row.getValue('podfic_id')}`}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            style={{
              padding: '0px',
            }}
          >
            <span
              style={{
                whiteSpace: 'nowrap',
              }}
            >
              <OpenInNew />
            </span>
          </IconButton>
        </Link>
      ),
    }),
    columnHelper.display({
      id: 'add-related',
      cell: (props) => (
        <AddMenu
          podficTitle={props.row.getValue('title')}
          podficId={props.row.getValue('podfic_id')}
          length={props.row.getValue('length')}
          options={['cover_art', 'file', 'resource', 'note', 'chapter']}
        />
      ),
    }),
    columnHelper.display({
      id: 'add-recording-session',
      cell: (props) => (
        <Link
          href={`/forms/recording-session/new?podfic_id=${props.row.id}&return_url=${pathname}`}
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
        <Link href={`/dashboard/html?podfic_id=${props.row.id}`}>
          <Button style={{ padding: '0px' }} variant='contained'>
            HTML
          </Button>
        </Link>
      ),
    }),
  ];

  const [columnVisibility, setColumnVisibility] = usePersistentState<any>(
    'PODFIC_TABLE_COLUMN_VISIBILITY',
    columns.reduce((acc, column) => {
      if ((column.meta as any)?.hidden && (column as any)?.accessorKey) {
        acc[(column as any).accessorKey as string] = false;
      }
      return acc;
    }, {})
  );

  const updatePodfic = async (podfic: Podfic & Work & Fandom) => {
    try {
      await updatePodficMinified(
        JSON.stringify({
          podfic_id: podfic.podfic_id,
          length: podfic.length,
          // TODO: is any processing needed on this
          // presumably not since it's been fine but do actually check that
          posted_date: podfic.posted_date,
          ao3_link: podfic.ao3_link,
          status: podfic.status,
        })
      );
      await mutate((key) => Array.isArray(key) && key[0] === '/db/podfics');
    } catch (e) {
      console.error('Error updating podfic inline:', e);
    }
  };

  return (
    <div>
      <CustomTable
        isLoading={isLoading}
        data={podfics}
        columns={columns}
        rowKey='podfic_id'
        rowCanExpand
        showRowCount
        editingRowId={editingRowId}
        setEditingRowId={setEditingRowId}
        initialState={{
          columnPinning: {
            left: ['expand', 'number', 'title'],
          },
        }}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        showClearFilters
        showResetDefaultFilters
        showColumnVisibility
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        updateItemInline={async (editingRow) => {
          await updatePodfic(editingRow);
        }}
        globalFilterFn='includesString'
        additionalFilters={
          <div className={styles.flexRow} style={{ alignItems: 'center' }}>
            <FormControlLabel
              label='Include multivoices'
              control={
                <Checkbox
                  value={includeMultivoice}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const filterValue = columnFilters.find(
                        (filter) => filter?.id === 'type'
                      )?.value;
                      if (!!filterValue && Array.isArray(filterValue))
                        setColumnFilters((filters) =>
                          filters.map((filter) =>
                            filter?.id === 'type'
                              ? {
                                  id: 'type',
                                  value: [
                                    ...filterValue,
                                    PodficType.MULTIVOICE,
                                  ],
                                }
                              : filter
                          )
                        );
                    } else {
                      const filter = columnFilters.find(
                        (filter) => filter?.id === 'type'
                      );
                      if (!filter) {
                        setColumnFilters((filters) => [
                          ...filters,
                          {
                            id: 'type',
                            value: [
                              ...Object.values(PodficType).filter(
                                (type) => type !== PodficType.MULTIVOICE
                              ),
                              null,
                            ],
                          },
                        ]);
                      } else {
                        const value = filter.value;
                        if (!value || !Array.isArray(value)) {
                          setColumnFilters((filters) =>
                            filters.map((filter) =>
                              filter?.id === 'type'
                                ? {
                                    id: 'type',
                                    value: [
                                      ...Object.values(PodficType).filter(
                                        (type) => type !== PodficType.MULTIVOICE
                                      ),
                                      null,
                                    ],
                                  }
                                : filter
                            )
                          );
                        } else {
                          setColumnFilters((filters) =>
                            filters.map((filter) =>
                              filter?.id === 'type'
                                ? {
                                    id: 'type',
                                    value: value.filter(
                                      (type) => type !== PodficType.MULTIVOICE
                                    ),
                                  }
                                : filter
                            )
                          );
                        }
                      }
                    }
                  }}
                />
              }
            />
            <FormControlLabel
              label='Only podfics missing AA links'
              checked={missingAALinks}
              control={
                <Checkbox
                  onChange={(e) => {
                    router.push(
                      `${pathname}?missing_aa_links=${e.target.checked}`
                    );
                    // router.refresh();
                    window.location.reload();
                  }}
                />
              }
            />
          </div>
        }
        getExpandedContent={(row) => (
          <>
            {!!row.original.coverArt && (
              <>
                <tr key='cover-art-expand'>
                  <td
                    colSpan={row.getAllCells().length}
                    key='cover-art'
                    style={{ paddingLeft: '30px' }}
                  >
                    <span>
                      <b>Cover Art</b>
                    </span>
                  </td>
                </tr>
                <tr key='cover-art-expanded'>
                  <td
                    colSpan={row.getAllCells().length}
                    style={{ paddingLeft: '30px' }}
                  >
                    <table className={tableStyles.table}>
                      <thead>
                        <tr>
                          <th>Link</th>
                          <th>Cover artist</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <span
                              style={{
                                display: 'block',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                maxWidth: '100px',
                              }}
                            >
                              <ExternalLink
                                href={row.original.coverArt.image_link}
                              />
                            </span>
                          </td>
                          <td>{row.original.coverArt.cover_artist_name}</td>
                          <td>{row.original.coverArt.cover_art_status}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </>
            )}
            {/* TODO: files expanded state - should that be in additionalcontentrows */}
            <tr key={'files-expanded'}>
              <td
                key='2'
                colSpan={row.getVisibleCells().length}
                style={{ paddingLeft: '60px' }}
              >
                <FileTable
                  podficId={row.original.podfic_id}
                  podficTitle={row.getValue('title')}
                  onlyNonAAFiles={missingAALinks}
                  chapterId={null}
                  lengthColorScale={lengthColorScale}
                />
              </td>
            </tr>
            <tr key='recording-sessions-expand'>
              <td
                colSpan={row.getAllCells().length}
                style={{ paddingLeft: '30px' }}
              >
                <span>
                  <IconButton
                    style={{ padding: '0px' }}
                    onClick={() =>
                      setRecordingSessionsExpanded((prev) =>
                        prev.includes(row.original.podfic_id)
                          ? prev.filter((id) => id !== row.original.podfic_id)
                          : [...prev, row.original.podfic_id]
                      )
                    }
                  >
                    {recordingSessionsExpanded.includes(
                      row.original.podfic_id
                    ) ? (
                      <KeyboardArrowDown />
                    ) : (
                      <KeyboardArrowRight />
                    )}
                  </IconButton>
                  Recording Sessions
                </span>
              </td>
            </tr>
            {recordingSessionsExpanded.includes(row.original.podfic_id) && (
              <tr key={'recording-sessions-expanded'}>
                <td
                  colSpan={row.getVisibleCells().length}
                  style={{ paddingLeft: '60px' }}
                >
                  <RecordingSessionTable
                    podficId={row.original.podfic_id}
                    full
                    returnUrl={pathname}
                  />
                </td>
              </tr>
            )}

            <AdditionalContentRows
              width={row.getVisibleCells().length}
              notes={row.original.notes ?? []}
              // TODO: pull in resources as well
              resources={row.original.resources ?? []}
              podfic_id={row.original.podfic_id}
            />
          </>
        )}
      />
    </div>
  );
}
