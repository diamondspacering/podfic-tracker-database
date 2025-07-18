'use client';

import { sourceCodePro } from '@/app/fonts/fonts';
import { useTags, useToPodficPodfics } from '@/app/lib/swrLoaders';
import {
  arrayIncludesFilter,
  tagFilter,
  useColorScale,
  useLengthColorScale,
} from '@/app/lib/utils';
import { usePersistentState } from '@/app/lib/utilsFrontend';
import { TableCell } from '@/app/ui/table/TableCell';
import { Add, Check, Edit, OpenInNew } from '@mui/icons-material';
import { Autocomplete, Chip, IconButton, Link, TextField } from '@mui/material';
import { ColumnFiltersState, createColumnHelper } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import tableStyles from '@/app/ui/table/table.module.css';
import { FilterType, getDefaultLength, PodficStatus } from '@/app/types';
import { HeaderCell } from '@/app/ui/table/HeaderCell';
import { getLengthText } from '@/app/lib/format';
import { addLengths } from '@/app/lib/lengthHelpers';
import CustomTable from '@/app/ui/table/CustomTable';
import TagBadge from '@/app/ui/TagBadge';
import { mutate } from 'swr';
import { linkTagToPodfic, unlinkTagFromPodfic } from '@/app/lib/updaters';
import TagSelect from '@/app/ui/TagSelect';

export default function ToPodficTable() {
  const { podfics, isLoading } = useToPodficPodfics();
  const { tags, isLoading: tagsLoading } = useTags();

  const lengthColorScale = useLengthColorScale(podfics, 'length');
  const wordcountColorScale = useColorScale(podfics, 'wordcount');

  const columnHelper = createColumnHelper<Podfic & Work & Fandom & Event>();
  const [columnFilters, setColumnFilters] =
    usePersistentState<ColumnFiltersState>(
      'TO_PODFIC_TABLE_COLUMN_FILTERS',
      []
    );

  const [editingTagsId, setEditingTagsId] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<Tag[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);

  const saveTagsForRow = useCallback(
    async (tags: Tag[], originalTags: Tag[], rowId: string) => {
      const id = parseInt(rowId);
      const tagsToRemove = originalTags.filter(
        (ot) => !tags.find((t) => t.tag_id === ot.tag_id)
      );
      const tagsToAdd = tags.filter(
        (t) => !originalTags.find((ot) => ot.tag_id === t.tag_id)
      );

      await Promise.all(
        tagsToRemove.map((tag) => unlinkTagFromPodfic(tag.tag_id, id))
      );
      await Promise.all(
        tagsToAdd.map((tag) => linkTagToPodfic(tag.tag_id, id))
      );

      await mutate('/db/topodfic');
    },
    []
  );

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
    columnHelper.accessor('rating', {
      header: (props) => <HeaderCell text='Rating' {...props} />,
      cell: TableCell,
      meta: {
        // TODO: just custom enum types and filters...?
        type: 'rating',
        filterType: FilterType.STRING,
        columnName: 'Rating',
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
        hidden: true,
        immutable: true,
        colorScale: lengthColorScale,
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
    columnHelper.accessor('raw_length', {
      header: 'Raw Length',
      cell: TableCell,
      meta: {
        type: 'length',
        colorScale: lengthColorScale,
        hidden: true,
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
    columnHelper.accessor('ao3_link', {
      header: 'Link',
      cell: TableCell,
      meta: {
        type: 'link',
        columnName: 'AO3 Link',
      },
    }),
    columnHelper.accessor('chapter_count', {
      header: (props) => <HeaderCell text='Chapters' {...props} />,
      cell: TableCell,
      meta: {
        type: 'string',
        // TODO: number filtering on this
        columnName: 'Chapters',
      },
    }),
    columnHelper.display({
      id: 'edit-full',
      cell: (props) => (
        <Link
          href={`/forms/podfic/${props.row.id}`}
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
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: () => <></>,
      meta: {
        type: 'string',
        filterType: FilterType.OTHER,
        hidden: true,
        immutable: true,
      },
      filterFn: tagFilter,
    }),
  ];

  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, column) => {
      if ((column.meta as any)?.hidden && (column as any)?.accessorKey) {
        acc[(column as any).accessorKey as string] = false;
      }
      return acc;
    }, {})
  );

  const tagFilterValue = useMemo(
    () => columnFilters.find((filter) => filter.id === 'tags')?.value as Tag[],
    [columnFilters]
  );

  // TODO: how to efficiently add tags? just inline edit...? eh that might not work right
  // add link to editing whole podfic
  // tag filtering
  // actually good tag display
  // actually show notes & stuff
  return (
    <div>
      <CustomTable
        isLoading={isLoading}
        data={podfics}
        columns={columns}
        rowKey='podfic_id'
        showRowCount
        rowCanExpand
        rowsAlwaysExpanded
        editingRowId={null}
        setEditingRowId={() => {}}
        updateItemInline={async () => {}}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        showClearFilters
        showResetDefaultFilters
        showColumnVisibility
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        globalFilterFn='includesString'
        additionalFilters={
          <div>
            <br />
            <div style={{ display: 'flex' }}>
              <Autocomplete
                sx={{ minWidth: '200px' }}
                loading={tagsLoading}
                options={tags}
                getOptionLabel={(option) => option.tag}
                multiple
                value={tagFilterValue}
                onChange={(_, newValue) => {
                  setColumnFilters((prev) =>
                    prev.map((filter) =>
                      filter.id === 'tags'
                        ? { id: 'tags', value: newValue }
                        : filter
                    )
                  );
                }}
                renderTags={(values, getTagProps) => {
                  return values.map((option: Tag, index: number) => {
                    const { key, ...itemProps } = getTagProps({ index });
                    return <Chip label={option.tag} key={key} {...itemProps} />;
                  });
                }}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      size='small'
                      label='Filter by tags&nbsp;&nbsp;'
                    />
                  );
                }}
              />
            </div>
          </div>
        }
        getExpandedContent={(row) => (
          <tr>
            <td colSpan={3} style={{ paddingLeft: '30px', maxWidth: '200px' }}>
              <span
                style={{ display: 'inline-flex', gap: '5px', flexWrap: 'wrap' }}
              >
                {editingTagsId === row.id ? (
                  <>
                    {editingTags.map((tag, i) => (
                      <TagBadge
                        key={i}
                        tag={tag}
                        editable
                        updateTagCallback={(newTag) =>
                          setEditingTags((prev) =>
                            prev.map((tag) =>
                              tag.tag_id === newTag.tag_id ? newTag : tag
                            )
                          )
                        }
                        removeCallback={() =>
                          setEditingTags((prev) =>
                            prev.filter((t) => t.tag_id !== tag.tag_id)
                          )
                        }
                      />
                    ))}
                    <IconButton
                      style={{ padding: '0px' }}
                      onClick={() => setIsAddingTag(true)}
                    >
                      <Add />
                    </IconButton>
                    {isAddingTag && (
                      <TagSelect
                        existingTags={editingTags}
                        addToExistingTags={(newTag) => {
                          setEditingTags((prev) => [...prev, newTag]);
                          setIsAddingTag(false);
                        }}
                        showExistingTags={false}
                      />
                    )}
                    <IconButton
                      style={{ padding: '0px' }}
                      onClick={async () => {
                        await saveTagsForRow(
                          editingTags,
                          row.original.tags ?? [],
                          row.id
                        );
                        setEditingTags([]);
                        setEditingTagsId(null);
                      }}
                    >
                      <Check />
                    </IconButton>
                  </>
                ) : (
                  <>
                    {row.original.tags?.map((tag, i) => (
                      <TagBadge key={i} tag={tag} />
                    ))}
                    <IconButton
                      style={{ padding: '0px' }}
                      onClick={() => {
                        setEditingTags(row.original.tags ?? []);
                        setEditingTagsId(row.id);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </>
                )}
              </span>
            </td>
          </tr>
        )}
      />
    </div>
  );
}
