import { Column, Table } from '@tanstack/react-table';
import FilterMenu from './FilterMenu';
import {
  getFilterValues,
  getResetFilterForColumn,
} from '@/app/lib/defaultColumnFilters';

export const HeaderCell = ({
  column,
  table,
  text,
}: {
  column: Column<any, any>;
  header: any;
  table: Table<any>;
  text: string;
}) => {
  const meta = table.options.meta as any;
  const columnMeta = column.columnDef.meta as any;
  const isFilterable = column.getCanFilter();
  // const columnFilters = table.getState().columnFilters;
  // const setColumnFilters = (table.options.meta as any)?.setColumnFilters;

  const values = getFilterValues(column);

  return (
    <span>
      {text}{' '}
      {isFilterable ? (
        <FilterMenu
          options={values}
          type={columnMeta?.filterType}
          filter={column.getFilterValue() ?? []}
          setFilter={(value) => {
            console.log({ value });
            column.setFilterValue(value);
          }}
          resetFilter={() => {
            console.log('resetting filter');
            console.log('column id:', column.id);
            console.log('column filters:', table.getState().columnFilters);
            column.setFilterValue(getResetFilterForColumn(column));
          }}
          isActivated={meta?.filterActivated(column, columnMeta?.filterType)}
        />
      ) : (
        <></>
      )}
    </span>
  );
};
