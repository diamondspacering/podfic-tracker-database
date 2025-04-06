'use client';

import {
  addLengths,
  format2Digits,
  formatDateString,
  formatDateStringMonthFirst,
  getLengthText,
  getLengthValue,
} from '@/app/lib/format';
import {
  FilterType,
  getDefaultLength,
  PermissionStatus,
  PodficStatus,
  PodficType,
} from '@/app/types';
import AddMenu from '@/app/ui/AddMenu';
import { TableCell } from '@/app/ui/table/TableCell';
import {
  ColumnFiltersState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import ColorScale from 'color-scales';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import styles from '@/app/dashboard/dashboard.module.css';
import tableStyles from '@/app/ui/table/table.module.css';
import { updatePodficMinified } from '@/app/lib/updaters';
import Link from 'next/link';
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Switch,
  TextField,
} from '@mui/material';
import {
  Close,
  KeyboardArrowDown,
  KeyboardArrowRight,
  Mic,
  OpenInNew,
} from '@mui/icons-material';
import { sourceCodePro } from '@/app/fonts/fonts';
import { HeaderCell } from '@/app/ui/table/HeaderCell';
import { arrayIncludesFilter, usePersistentState } from '@/app/lib/utils';
import { usePathname } from 'next/navigation';
import { usePodficsFull } from '@/app/lib/swrLoaders';
import { mutate } from 'swr';
import AdditionalContentRows from '@/app/ui/table/AdditionalContentRows';
import FileTable from '@/app/ui/table/FileTable';
import { EditCell } from '@/app/ui/table/EditCell';
import RecordingSessionTable from '@/app/ui/table/RecordingSessionTable';
import {
  resetAllColumns,
  resetAllColumnsToDefault,
} from './defaultColumnFilters';

export default function PodficTable() {
  const { podfics, isLoading } = usePodficsFull();

  const pathname = usePathname();

  const [filesExpanded, setFilesExpanded] = useState<number[]>([]);
  const [resourcesExpanded, setResourcesExpanded] = useState<number[]>([]);
  const [recordingSessionsExpanded, setRecordingSessionsExpanded] = useState<
    number[]
  >([]);
  const [excludingMultivoice, setExcludingMultivoice] = useState(false);

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

  // TODO: of COURSE this doesn't load in properly it probably needs to be set somehow
  const excludeMultivoice = useMemo(() => {
    const typeFilter = columnFilters.find((filter) => filter?.id === 'type');
    if (!typeFilter || !typeFilter.value) return false;
    return !(typeFilter.value as Array<string>).includes('multivoice');
  }, [columnFilters]);

  useEffect(
    () => setExcludingMultivoice(excludeMultivoice),
    [excludeMultivoice]
  );

  useEffect(() => setExcludingMultivoice(excludeMultivoice), []);

  // TODO: extract to util
  const dateFilter = (row, columnId, filterValue) => {
    if (!filterValue) return false;
    // TODO: the range stuff, will need more logging for that prob
    // also make it work when values removed???

    // check for falsy values
    if (
      !filterValue.year &&
      !filterValue.month &&
      !filterValue.day &&
      (!filterValue.range ||
        !Object.keys(filterValue.range).length ||
        (!filterValue.range.start && !filterValue.range.end))
    )
      return true;

    let matchesDate = false;

    if (Object.keys(filterValue).includes('range')) {
      const { start, end } = filterValue.range;
      const postedDate = new Date(row.getValue(columnId));
      if (start && end) {
        matchesDate =
          postedDate >= new Date(start) && postedDate <= new Date(end);
      } else if (start) {
        matchesDate = postedDate >= new Date(start);
      } else if (end) {
        matchesDate = postedDate <= new Date(end);
      }
    } else {
      if (Object.keys(filterValue).includes('year') && !!filterValue.year) {
        matchesDate =
          row.original.posted_year?.toString() === filterValue.year ||
          row.getValue(columnId)?.split('-')?.[0] === filterValue.year;
      }
      if (Object.keys(filterValue).includes('month') && !!filterValue.month) {
        matchesDate =
          matchesDate &&
          row.getValue(columnId)?.split('-')?.[1] ===
            format2Digits(filterValue.month);
      }
      if (Object.keys(filterValue).includes('day') && !!filterValue.day) {
        matchesDate =
          matchesDate &&
          row.getValue(columnId)?.split('-')?.[2] ===
            format2Digits(filterValue.day);
      }
    }

    return matchesDate;
  };

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
    // TODO: full length when expanded. oh yeah just put it as string then?
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
        // TODO: color scale for this
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
        const num = filteredRows?.length ?? 0;
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
        const num = filteredRows?.length ?? 0;
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
            // TODO: this isn't working correctly
            // use the dateformat util
            if (editingRowId === row.id)
              return currentVal
                ? formatDateString(
                    new Date(
                      currentVal.includes('T')
                        ? currentVal
                        : `${currentVal}T00:00:00`
                    )
                  )
                : '';
            return currentVal
              ? isSingleYear
                ? currentVal
                : formatDateStringMonthFirst(new Date(currentVal))
              : '';
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
  const [columnVisibilityExpanded, setColumnVisibilityExpanded] =
    useState(false);

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingRow, setEditingRow] = useState<Podfic & Work & Fandom & Event>(
    {} as Podfic & Work & Fandom & Event
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
      await mutate('/db/podfics');
    } catch (e) {
      console.error('Error updating podfic inline:', e);
    }
  };

  const table = useReactTable({
    data: podfics,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (row) => row.podfic_id?.toString(),
    enableMultiRowSelection: false,
    enableRowSelection: (row) =>
      editingRowId !== row.id && editingRowId !== parseInt(row.id),
    initialState: {
      columnPinning: {
        left: ['expand', 'number', 'title'],
      },
    },
    state: {
      columnFilters: columnFilters,
      columnVisibility: columnVisibility,
    },
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters(updaterOrValue);
    },
    onColumnVisibilityChange: (updaterOrValue) => {
      setColumnVisibility(updaterOrValue);
    },
    meta: {
      columnFilters,
      setColumnFilters,
      // TODO: transfer this over to the helper function in utils
      filterActivated: (column, filterType) => {
        if (!columnFilters.some((f) => f.id === column.id)) return false;
        if (filterType === FilterType.STATUS) {
          return !Object.values(PodficStatus).every((f) =>
            (column.getFilterValue() ?? []).includes(f)
          );
        }
        if (filterType === FilterType.PERMISSION) {
          return !Object.values(PermissionStatus).every((f) =>
            (column.getFilterValue() ?? []).includes(f)
          );
        }
        if (filterType === FilterType.TYPE) {
          return !Array.from(column.getFacetedUniqueValues().keys()).every(
            (f) => (column.getFilterValue() ?? []).includes(f)
          );
        }
        // so should list as activated if there's non-truthy keys in there
        if (filterType === FilterType.DATE) {
          return !!column.getFilterValue() &&
            !!Object.keys(column.getFilterValue()).length &&
            !!Object.values(column.getFilterValue()).some((f) => !!f) &&
            column.getFilterValue().range
            ? !!Object.keys(column.getFilterValue().range).length &&
                !!Object.values(column.getFilterValue().range).some((f) => !!f)
            : true;
        }
      },
      // TODO: alter the editing system & make work w/ swr
      // huh what does that mean - persisting the changes in the cache
      editingRowId,
      setEditingRowId,
      editingRow,
      setEditingRow,
      updateData: (_rowId, columnId, value) => {
        setEditingRow((prev) => ({ ...prev, [columnId]: value }));
      },
      revertRow: () => {
        setEditingRow(null);
      },
      submitRow: async () => {
        console.log({ editingRow });
        await updatePodfic(editingRow);
      },
    },
  });

  return (
    <div>
      <div className={tableStyles.visibilityToggleContainer}>
        <span>
          <IconButton
            style={{ padding: '0px' }}
            onClick={(e) => {
              e.stopPropagation();
              setColumnVisibilityExpanded((prev) => !prev);
            }}
          >
            {columnVisibilityExpanded ? (
              <KeyboardArrowDown />
            ) : (
              <KeyboardArrowRight />
            )}
          </IconButton>
          <b>Column Visibility</b>
        </span>
        <br />
        <div className={tableStyles.flexRow}>
          {columnVisibilityExpanded &&
            table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <FormControlLabel
                  key={column.id}
                  label={
                    (column.columnDef.meta as any)?.columnName ?? column.id
                  }
                  control={
                    <Switch
                      checked={column.getIsVisible()}
                      onChange={column.getToggleVisibilityHandler()}
                    />
                  }
                />
              ))}
        </div>
      </div>
      <div className={styles.flexRow}>
        {/* TODO: make this debounced it needs it */}
        <TextField
          size='small'
          label='Title search'
          value={columnFilters.find((f) => f.id === 'title')?.value ?? ''}
          onChange={(e) =>
            columnFilters.find((f) => f.id === 'title')
              ? setColumnFilters((prev) =>
                  prev.map((f) =>
                    f.id === 'title' ? { ...f, value: e.target.value } : f
                  )
                )
              : setColumnFilters((prev) => [
                  ...prev,
                  { id: 'title', value: e.target.value },
                ])
          }
          sx={{
            width: 'fit-content',
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => {
                      setColumnFilters((prev) =>
                        prev.map((f) =>
                          f.id === 'title' ? { ...f, value: '' } : f
                        )
                      );
                    }}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControlLabel
          label='Exclude multivoices'
          control={
            <Checkbox
              value={excludingMultivoice}
              onChange={(e) => {
                if (e.target.checked) {
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
                } else {
                  const filterValue = columnFilters.find(
                    (filter) => filter?.id === 'type'
                  )?.value;
                  if (!!filterValue && Array.isArray(filterValue))
                    setColumnFilters((filters) =>
                      filters.map((filter) =>
                        filter?.id === 'type'
                          ? {
                              id: 'type',
                              value: [...filterValue, PodficType.MULTIVOICE],
                            }
                          : filter
                      )
                    );
                }
              }}
            />
          }
        />
      </div>

      <br />
      <Button onClick={() => setColumnFilters(resetAllColumns(table))}>
        Clear All Filters
      </Button>
      <Button onClick={() => setColumnFilters(resetAllColumnsToDefault(table))}>
        Reset Filters to Default
      </Button>
      <br />
      <b>Displaying {table.getFilteredRowModel().rows.length}</b>
      <table className={tableStyles.table}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              p
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
              {/* TODO: insert expanded content, incl. like cover art */}
              {row.getIsExpanded() && (
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
                                    <a href={row.original.coverArt.image_link}>
                                      {row.original.coverArt.image_link}
                                    </a>
                                  </span>
                                </td>
                                <td>
                                  {row.original.coverArt.cover_artist_name}
                                </td>
                                <td>
                                  {row.original.coverArt.cover_art_status}
                                </td>
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
                                ? prev.filter(
                                    (id) => id !== row.original.podfic_id
                                  )
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
                  {recordingSessionsExpanded.includes(
                    row.original.podfic_id
                  ) && (
                    <tr key={'recording-sessions-expanded'}>
                      <td
                        colSpan={row.getVisibleCells().length}
                        style={{ paddingLeft: '60px' }}
                      >
                        <RecordingSessionTable
                          podficId={row.original.podfic_id}
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
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th key={header.id}>
                  <span>
                    {flexRender(
                      header.column.columnDef.footer,
                      header.getContext()
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      </table>
    </div>
  );
}
