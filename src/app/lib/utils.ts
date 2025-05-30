import { useEffect, useMemo, useState } from 'react';
import {
  format2Digits,
  formatDateString,
  formatDateStringMonthFirst,
} from './format';
import { FilterType, getDefaultLength } from '../types';
import ColorScale from 'color-scales';
import { getLengthValue } from './lengthHelpers';

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
  console.log({ formattedDate });
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

export const useColorScale = (data: any[], propertyName: string) => {
  const colorScale = useMemo(
    () =>
      new ColorScale(
        0,
        data.length
          ? Math.max(Math.max(...data.map((d) => d[propertyName] ?? 0)), 1)
          : 1,
        ['#ffffff', '#4285f4']
      ),
    [data, propertyName]
  );

  return colorScale;
};

export const useLengthColorScale = (data: any[], propertyName: string) => {
  const colorScale = useMemo(
    () =>
      new ColorScale(
        0,
        data.length
          ? Math.max(
              Math.max(
                ...data.map((d) =>
                  getLengthValue(d[propertyName] ?? getDefaultLength())
                )
              ),
              1
            )
          : 1,
        ['#ffffff', '#4285f4']
      ),
    [data, propertyName]
  );

  return colorScale;
};

export const dateFilter = (row, columnId, filterValue) => {
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
