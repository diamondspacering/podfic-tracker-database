import { Column } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';
import tableStyles from '@/app/ui/table/table.module.css';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton, FormControlLabel, Switch } from '@mui/material';

interface ColumnVisibilityToggleContainerProps<T> {
  columns: Column<T, unknown>[];
}

// TODO: some of this may be a little messy/have duplicated logic
/** Container that shows all columns for a table that can be toggled visible/invisible
 * @param columns columns in table, gotten by table.getAllColumns()
 */
export default function ColumnVisibilityToggleContainer<T>({
  columns,
}: ColumnVisibilityToggleContainerProps<T>) {
  const [columnVisibilityExpanded, setColumnVisibilityExpanded] =
    useState(false);
  const [dedupedColumns, setDedupedColumns] = useState<Column<T, unknown>[]>(
    [],
  );
  // this is needed since the columns' built-in visibility doesn't update fast enough
  // and wouldn't update toggles on/off immediately
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});

  const updateDedupedColumns = useCallback(
    () =>
      setDedupedColumns(
        columns.reduce((acc, column) => {
          if (acc.some((col) => col.id === column.id)) return acc;
          else return [...acc, column];
        }, []),
      ),
    [columns],
  );
  const updateColumnVisibility = useCallback(
    (columnName: string, visible: boolean) =>
      setColumnVisibility((prev) => ({ ...prev, [columnName]: visible })),
    [],
  );

  useEffect(() => {
    updateDedupedColumns();
  }, [updateDedupedColumns, columns]);

  useEffect(() => {
    setColumnVisibility(
      dedupedColumns.reduce((acc, val) => {
        acc[val.id] = val.getIsVisible();
        return acc;
      }, {}),
    );
  }, [dedupedColumns]);

  const onColumnVisibilityChange = useCallback(
    (id: string, checked: boolean) => {
      const affectedColumns = columns.filter((col) => col.id === id);
      const affectedDedupedColumns = dedupedColumns.filter(
        (col) => col.id === id,
      );
      affectedColumns.forEach((col) => col.toggleVisibility(checked));
      affectedDedupedColumns.forEach((col) => col.toggleVisibility(checked));
      updateColumnVisibility(id, checked);
    },
    [columns, dedupedColumns, updateColumnVisibility],
  );

  return (
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
          dedupedColumns
            .filter((column) => column.getCanHide())
            .map((column) => (
              <FormControlLabel
                key={column.id}
                label={(column.columnDef.meta as any)?.columnName ?? column.id}
                control={
                  <Switch
                    checked={columnVisibility[column.id] ?? false}
                    onChange={(e, checked) => {
                      onColumnVisibilityChange(column.id, checked);
                      updateDedupedColumns();
                    }}
                  />
                }
              />
            ))}
      </div>
    </div>
  );
}
