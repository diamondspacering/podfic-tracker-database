import {
  ColumnFiltersState,
  FilterFnOption,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  InitialTableState,
  Row,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Dispatch,
  Fragment,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import tableStyles from '@/app/ui/table/table.module.css';
import {
  Button,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Skeleton,
  Switch,
  TextField,
} from '@mui/material';
import {
  Close,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from '@mui/icons-material';
import styles from '@/app/dashboard/dashboard.module.css';
import {
  resetAllColumns,
  resetAllColumnsToDefault,
} from '@/app/lib/defaultColumnFilters';
import { filterActivated } from '@/app/lib/utils';

interface CustomTableProps<T> {
  isLoading: boolean;
  data: T[];
  columns: any[];
  rowKey: string;
  initialState?: InitialTableState;
  showRowCount?: boolean;
  numLoadingRows?: number;

  // editing
  editingRowId: string | null;
  setEditingRowId: Dispatch<SetStateAction<string | null>>;
  updateItemInline: (item: T) => Promise<void>;

  // filtering
  columnFilters: ColumnFiltersState;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  showClearFilters?: boolean;
  showResetDefaultFilters?: boolean;
  globalFilterFn?: FilterFnOption<T>;
  additionalFilters?: ReactNode;

  // column visibility
  showColumnVisibility?: boolean;
  columnVisibility?: VisibilityState;
  setColumnVisibility?: Dispatch<SetStateAction<VisibilityState>>;

  // row expansion
  rowCanExpand?: boolean;
  rowsAlwaysExpanded?: boolean;
  getExpandedContent?: (row: Row<T>) => ReactNode;
  getSubRows?: (row: T) => T[];

  extraParams?: any;
}

export default function CustomTable<T>({
  isLoading,
  data,
  columns,
  rowKey,
  rowCanExpand,
  rowsAlwaysExpanded,
  editingRowId,
  setEditingRowId,
  initialState,
  columnFilters,
  setColumnFilters,
  showClearFilters = false,
  showResetDefaultFilters = false,
  globalFilterFn,
  additionalFilters,
  showColumnVisibility = false,
  columnVisibility = {},
  setColumnVisibility = () => {},
  updateItemInline,
  showRowCount = false,
  getExpandedContent = () => <></>,
  getSubRows,
  numLoadingRows = 10,
  extraParams = {},
}: CustomTableProps<T>) {
  const [editingRow, setEditingRow] = useState<T>({} as T);
  const [columnVisibilityExpanded, setColumnVisibilityExpanded] =
    useState(false);

  const tableData = useMemo(
    () => (isLoading ? Array(numLoadingRows).fill({} as T) : data),
    [isLoading, numLoadingRows, data]
  );
  const tableColumns = useMemo(
    () =>
      isLoading
        ? columns.map((column) => ({
            ...column,
            // TODO: better skeleton styling?
            cell: () => <Skeleton width='100%' />,
          }))
        : columns,
    [isLoading, columns]
  );

  useEffect(() => console.log({ data }), [data]);

  const table = useReactTable<T>({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel<T>(),
    getExpandedRowModel: getExpandedRowModel<T>(),
    getRowCanExpand: () => rowCanExpand || rowsAlwaysExpanded,
    ...(!!getSubRows ? { getSubRows } : {}),
    getFilteredRowModel: getFilteredRowModel<T>(),
    getFacetedUniqueValues: getFacetedUniqueValues<T>(),
    getRowId: (row) => row[rowKey]?.toString(),
    enableMultiRowSelection: false,
    enableRowSelection: (row) => editingRowId !== row.id,
    ...(globalFilterFn ? { globalFilterFn } : {}),
    ...(initialState ? { initialState } : {}),
    state: {
      columnFilters,
      columnVisibility,
    },
    onColumnFiltersChange: (updaterOrValue) => {
      setColumnFilters(updaterOrValue);
    },
    onColumnVisibilityChange: (updaterOrValue) => {
      setColumnVisibility(updaterOrValue);
    },
    ...extraParams,
    meta: {
      columnFilters,
      setColumnFilters,
      filterActivated: (column, filterType) => {
        if (!columnFilters.some((f) => f.id === column.id)) return false;
        return filterActivated(column, filterType);
      },
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
        await updateItemInline(editingRow);
      },
    },
  });

  return (
    <div>
      {showColumnVisibility && (
        <>
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
          <br />
        </>
      )}
      {!!globalFilterFn && (
        <TextField
          size='small'
          placeholder='Search...'
          value={table.getState().globalFilter}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
          sx={{
            width: 'fit-content',
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    onClick={() => {
                      table.setGlobalFilter('');
                    }}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      )}
      {additionalFilters}
      {!!additionalFilters && <br />}
      {(showClearFilters || showResetDefaultFilters) && (
        <>
          <div className={styles.flexRow} style={{ alignItems: 'center' }}>
            {showClearFilters && (
              <Button onClick={() => setColumnFilters(resetAllColumns(table))}>
                Clear All Filters
              </Button>
            )}
            {showResetDefaultFilters && (
              <Button
                onClick={() =>
                  setColumnFilters(resetAllColumnsToDefault(table))
                }
              >
                Reset Filters to Default
              </Button>
            )}
          </div>
          <br />
        </>
      )}
      {showRowCount && !isLoading && (
        <b>Displaying {table.getFilteredRowModel().rows.length}</b>
      )}
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
          {(isLoading ? table.getCoreRowModel() : table.getRowModel()).rows.map(
            (row) => (
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
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
                {(row.getIsExpanded() || rowsAlwaysExpanded) &&
                  getExpandedContent(row)}
              </Fragment>
            )
          )}
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
