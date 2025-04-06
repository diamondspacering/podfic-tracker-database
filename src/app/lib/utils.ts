import { useEffect, useState } from 'react';
import { formatDateString, formatDateStringMonthFirst } from './format';
import { Column } from '@tanstack/react-table';
import { FilterType } from '../types';

// TODO: this complains about localStorage not being defined, but it does still work
export const usePersistentState = <T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

// TODO: still running into issues w/ this, try again
export const formatTableDate = (
  date: string,
  isEditingRow: boolean,
  editingRowVal?: string
) => {
  let formattedDate = '';
  if (isEditingRow && !!editingRowVal)
    formattedDate = formatDateString(
      new Date(
        editingRowVal?.includes('T') ? date : `${editingRowVal}T00:00:00`
      )
    );
  else if (!!date) formattedDate = formatDateStringMonthFirst(new Date(date));
  return formattedDate;
};

export const arrayIncludesFilter = (row, columnId, filterValue) => {
  return filterValue.includes(row.getValue(columnId));
};

export const filterActivated = (column, filterType: FilterType) => {
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
    return !Array.from(column.getFacetedUniqueValues().keys()).every((f) =>
      (column.getFilterValue() ?? []).includes(f)
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
};
