import { Column, HeaderContext, Table } from '@tanstack/react-table';
import { useEffect, useMemo } from 'react';
import FilterMenu from './FilterMenu';
import { PermissionStatus, PodficStatus } from '@/app/types';
import {
  getFilterValues,
  getResetFilterForColumn,
} from '@/app/lib/defaultColumnFilters';

// TODO: be able to provide data types for the header cell? with <T>? not needed but cool prob
export const HeaderCell = ({
  column,
  header,
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
  const columnFilters = table.getState().columnFilters;
  const setColumnFilters = (table.options.meta as any)?.setColumnFilters;

  const values = getFilterValues(column);

  // TODO: support other types of filters as well
  return (
    <span>
      {text}{' '}
      {isFilterable ? (
        <FilterMenu
          options={values}
          type={columnMeta?.filterType}
          filter={column.getFilterValue() ?? []}
          setFilter={(value) => {
            // if (Array.isArray(value) && value.length === 0) {
            //   console.log('resetting state');
            //   console.log(
            //     'column filters before:',
            //     table.getState().columnFilters
            //   );
            //   setColumnFilters(
            //     table.getState().columnFilters.filter((f) => f.id !== column.id)
            //   );
            // } else {
            //   console.log({ value });
            //   column.setFilterValue(value);
            // }
            console.log({ value });
            column.setFilterValue(value);
          }}
          // TODO: smarter filter reset (to everything instead)
          resetFilter={() => {
            console.log('resetting filter');
            console.log('column id:', column.id);
            console.log('column filters:', table.getState().columnFilters);
            // table.getState().columnFilters.filter((f) => f.id !== column.id);
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
