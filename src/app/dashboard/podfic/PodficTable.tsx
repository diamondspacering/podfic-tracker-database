'use client';

import { getLengthText } from '@/app/lib/format';
import {
  FilterType,
  getDefaultLength,
  PodficStatus,
  PodficType,
  SectionType,
  StatusType,
} from '@/app/types';
import AddMenu from '@/app/ui/AddMenu';
import { TableCell } from '@/app/ui/table/TableCell';
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/app/dashboard/dashboard.module.css';
import tableStyles from '@/app/ui/table/table.module.css';
import {
  updatePodficMinified,
  updateSectionMinified,
} from '@/app/lib/updaters';
import Link from 'next/link';
import { Button, Checkbox, FormControlLabel, IconButton } from '@mui/material';
import {
  Delete,
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
  getIsPostedChaptered,
  getPodficSectionId,
  useFixedColorScale,
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
import DeletePodficDialog from '@/app/ui/table/delete-podfic-dialog';
import { RawWPMCell, WPMCell } from '@/app/ui/table/WPMCells';

export default function PodficTable() {
  const searchParams = useSearchParams();
  const missingAALinks = searchParams.get('missing_aa_links') === 'true';
  const { podfics, isLoading } = usePodficsFull({ missingAALinks });

  const router = useRouter();

  const pathname = usePathname();

  const [recordingSessionsExpanded, setRecordingSessionsExpanded] = useState<
    number[]
  >([]);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [selectedDeletionProps, setSelectedDeletionProps] = useState<{
    podficId: number;
    workId: number;
    podficTitle: string;
  }>({ podficId: 0, workId: 0, podficTitle: '' });

  const lengthColorScale = useFixedColorScale(3600);
  const wordcountColorScale = useFixedColorScale(150000);

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
        columnName: 'Work ID',
      },
    }),
    columnHelper.display({
      id: 'expand',
      cell: (props) => (
        <IconButton
          style={{ padding: '0px' }}
          onClick={(e) => {
            const isExpanded = props.row.getIsExpanded();
            const isSelected = props.row.getIsSelected();
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
      id: 'log',
      cell: (props) => (
        <Button
          variant='contained'
          onClick={() => console.log(props.row.original)}
          style={{ padding: '0px' }}
        >
          Log
        </Button>
      ),
      meta: {
        columnName: 'log',
        hidden: true,
      },
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
    columnHelper.accessor('work_permission_status', {
      header: (props) => <HeaderCell text='Perm' {...props} />,
      cell: ({ row, ...rest }) => (
        <TableCell
          {...rest}
          getValue={() =>
            row.getValue('work_permission_status') ??
            row.original.author_permission_status
          }
          row={row}
        />
      ),
      meta: {
        type: 'status',
        statusType: StatusType.PERMISSION,
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
      cell: WPMCell,
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
      cell: RawWPMCell,
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
    columnHelper.display({
      id: 'sections',
      header: 'Chapters',
      cell: (props) =>
        props.row.original.chaptered ? (
          <Link
            href={`/dashboard/chapters/${props.row.id}`}
            onClick={(e) => e.stopPropagation()}
          >
            {`${
              props.row.original.sections?.filter((s) => {
                return (
                  s.status === PodficStatus.POSTED ||
                  s.status === PodficStatus.FINISHED ||
                  s.status === PodficStatus.POSTING ||
                  (props.row.original.section_type ===
                    SectionType.MULTIPLE_TO_SINGLE &&
                    s.number < 0)
                );
              }).length ?? '0'
            }/${props.row.original.sections?.length ?? '?'}`}
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
          workId={props.row.getValue('work_id')}
          sectionId={getPodficSectionId(props.row.original)}
          length={props.row.getValue('length')}
          options={[
            'cover_art',
            'file',
            'resource',
            'note',
            'permission_ask',
            'chapter',
          ]}
        />
      ),
    }),
    columnHelper.display({
      id: 'add-recording-session',
      cell: (props) => {
        let url = `/forms/recording-session/new?podfic_id=${props.row.id}`;
        const sectionId = getPodficSectionId(props.row.original);
        if (sectionId) url += `&section_id=${sectionId}`;
        url += `&return_url=${pathname}`;
        return (
          <Link href={url} onClick={(e) => e.stopPropagation()}>
            <Button
              variant='contained'
              style={{
                padding: '0px',
              }}
            >
              <Mic sx={{ padding: '0px' }} />
            </Button>
          </Link>
        );
      },
    }),
    columnHelper.display({
      id: 'generate-html',
      cell: (props) => {
        let url = `/dashboard/html?podfic_id=${props.row.id}`;
        const sectionId = getPodficSectionId(props.row.original);
        if (sectionId) url += `&section_id=${sectionId}`;
        return (
          <Link href={url}>
            <Button style={{ padding: '0px' }} variant='contained'>
              HTML
            </Button>
          </Link>
        );
      },
    }),
    columnHelper.display({
      id: 'delete',
      cell: (props) => (
        <Button
          onClick={() => {
            setSelectedDeletionProps({
              podficId: props.row.getValue('podfic_id'),
              workId: props.row.getValue('work_id'),
              podficTitle: props.row.getValue('title'),
            });
            setDeleteConfirmDialogOpen(true);
          }}
          style={{ padding: '0px' }}
        >
          <Delete />
        </Button>
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
          posted_date: podfic.posted_date,
          ao3_link: podfic.ao3_link,
          status: podfic.status,
        })
      );
      const isPostedChaptered = getIsPostedChaptered(
        podfic.section_type,
        podfic.chaptered
      );
      if (!isPostedChaptered) {
        const section = podfic.sections?.[0];
        if (section) {
          await updateSectionMinified(
            JSON.stringify({
              section_id: section.section_id,
              wordcount: podfic.wordcount,
              length: podfic.length,
              posted_date: podfic.posted_date,
              ao3_link: podfic.ao3_link,
              status: podfic.status,
            })
          );
        }
      }
      await mutate((key) => Array.isArray(key) && key[0] === '/db/podfics');
    } catch (e) {
      console.error('Error updating podfic inline:', e);
    }
  };

  return (
    <div>
      <DeletePodficDialog
        isOpen={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
        submitCallback={async () => {
          await mutate((key) => Array.isArray(key) && key[0] === '/db/podfics');
        }}
        podficId={selectedDeletionProps.podficId}
        workId={selectedDeletionProps.workId}
        podficTitle={selectedDeletionProps.podficTitle}
      />
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
            <tr key={'files-expanded'}>
              <td
                key='2'
                colSpan={row.getVisibleCells().length}
                style={{ paddingLeft: '60px' }}
              >
                <FileTable
                  podficId={row.original.podfic_id}
                  podficTitle={row.getValue('title')}
                  chaptered={row.original.chaptered}
                  onlyNonAAFiles={missingAALinks}
                  sectionId={getPodficSectionId(row.original)}
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
              resources={row.original.resources ?? []}
              permissionAsks={row.original.permission_asks ?? []}
              podfic_id={row.original.podfic_id}
            />
          </>
        )}
      />
    </div>
  );
}
