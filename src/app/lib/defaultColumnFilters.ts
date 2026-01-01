import {
  AuthorPermissionStatus,
  FilterType,
  PartStatus,
  PermissionAskStatus,
  PermissionStatus,
  PodficStatus,
  PodficType,
  Rating,
} from '@/app/types';
import { Column, ColumnFilter, Table } from '@tanstack/react-table';

const DEFAULT_DEFINED_FILTER_TYPES = [
  FilterType.STATUS,
  FilterType.PERMISSION,
  FilterType.AUTHOR_PERMISSION,
  FilterType.PERMISSION_ASK,
  FilterType.TYPE,
  FilterType.STRING,
  FilterType.OTHER,
];

export const defaultPodficStatusValues = Object.values(PodficStatus).filter(
  (status) => status !== PodficStatus.PLANNING
);

export const defaultAuthorPermissionStatusValues = Object.values(
  AuthorPermissionStatus
);
export const defaultPermissionAskStatusValues =
  Object.values(PermissionAskStatus);

export const allPermissionStatusValues = Array.from(
  new Set([
    ...Object.values(AuthorPermissionStatus),
    ...Object.values(PermissionAskStatus),
  ])
);

export const defaultPodficTypeValues = Object.values(PodficType).filter(
  (type) => type !== PodficType.MULTIVOICE
);

export const getDefaultFilterForColumn = (
  column: Column<any, any>
): ColumnFilter => {
  const filterType = (column.columnDef.meta as any)?.filterType as FilterType;
  let value: any = [];
  switch (filterType) {
    case FilterType.STATUS:
      value = defaultPodficStatusValues;
      break;
    case FilterType.PERMISSION:
      value = allPermissionStatusValues;
      break;
    case FilterType.AUTHOR_PERMISSION:
      value = defaultAuthorPermissionStatusValues;
      break;
    case FilterType.PERMISSION_ASK:
      value = defaultPermissionAskStatusValues;
      break;
    case FilterType.TYPE:
      value = defaultPodficTypeValues;
      break;
    case FilterType.OTHER:
      value = [];
      break;
    default:
      value = Array.from(column.getFacetedUniqueValues().keys()).sort();
  }
  return {
    id: column.id,
    value: !!value && Array.isArray(value) ? [...value, null] : value,
  };
};

export const getResetFilterForColumn = (column: Column<any, any>) => {
  const filterType = (column.columnDef.meta as any)?.filterType as FilterType;
  let value: any = [];
  switch (filterType) {
    case FilterType.STATUS:
      value = Object.values(PodficStatus);
      break;
    case FilterType.PERMISSION:
      value = allPermissionStatusValues;
      break;
    case FilterType.AUTHOR_PERMISSION:
      value = Object.values(AuthorPermissionStatus);
      break;
    case FilterType.PERMISSION_ASK:
      value = Object.values(PermissionAskStatus);
      break;
    case FilterType.TYPE:
      value = Object.values(PodficType);
      break;
    case FilterType.DATE:
      value = {};
      break;
    case FilterType.STRING:
      value = Array.from(column.getFacetedUniqueValues().keys()).sort();
      break;
    case FilterType.OTHER:
      value = [];
      break;
    default:
      value = null;
  }
  return {
    id: column.id,
    value:
      !!value && Array.isArray(value) && filterType !== FilterType.OTHER
        ? [...value, null]
        : value,
  };
};

export const getDefaultColumnFilters = (table: Table<any>) => {
  const columnsToGet = table
    .getAllColumns()
    .filter((c) =>
      DEFAULT_DEFINED_FILTER_TYPES.includes(
        (c.columnDef.meta as any)?.filterType
      )
    );
  const columnFilters = columnsToGet.map((c) => getDefaultFilterForColumn(c));
  return columnFilters;
};

export const resetAllColumns = (table: Table<any>) => {
  const columns = table.getAllColumns();
  const definedColumnIds = columns
    .filter((c) =>
      DEFAULT_DEFINED_FILTER_TYPES.includes(
        (c.columnDef.meta as any)?.filterType
      )
    )
    .map((c) => c.id);
  const columnFilters = columns.reduce((filters, c) => {
    if (definedColumnIds.includes(c.id)) {
      filters.push(getResetFilterForColumn(c));
    }
    return filters;
  }, []);
  return columnFilters;
};

export const resetAllColumnsToDefault = (table: Table<any>) => {
  const columns = table.getAllColumns();
  const definedColumnIds = columns
    .filter((c) =>
      DEFAULT_DEFINED_FILTER_TYPES.includes(
        (c.columnDef.meta as any)?.filterType
      )
    )
    .map((c) => c.id);
  const columnFilters = columns.reduce((filters, c) => {
    if (definedColumnIds.includes(c.id)) {
      filters.push(getDefaultFilterForColumn(c));
    }
    return filters;
  }, []);
  return columnFilters;
};

// organize by filter type

export const getFilterValues = (column: Column<any, any>) => {
  const filterType = (column.columnDef.meta as any)?.filterType as FilterType;
  switch (filterType) {
    case FilterType.STATUS:
      return Object.values(PodficStatus);
    case FilterType.PERMISSION:
      return allPermissionStatusValues;
    case FilterType.AUTHOR_PERMISSION:
      return Object.values(AuthorPermissionStatus);
    case FilterType.PERMISSION_ASK:
      return Object.values(PermissionAskStatus);
    case FilterType.PART_STATUS:
      return Object.values(PartStatus);
    case FilterType.RATING:
      return Object.values(Rating);
    case FilterType.TYPE:
      return Object.values(PodficType);
    case FilterType.STRING:
      return Array.from(column.getFacetedUniqueValues().keys()).sort();
    default:
      return [];
  }
};
