import {
  FilterType,
  PartStatus,
  PermissionStatus,
  PodficStatus,
  PodficType,
  Rating,
} from '@/app/types';
import { Column, ColumnFilter, Table } from '@tanstack/react-table';

const DEFAULT_DEFINED_FILTER_TYPES = [
  FilterType.STATUS,
  FilterType.PERMISSION,
  FilterType.TYPE,
  FilterType.STRING,
  FilterType.OTHER,
];

export const defaultPodficStatusValues = Object.values(PodficStatus).filter(
  (status) => status !== PodficStatus.PLANNING
);

export const defaultPermissionStatusValues = Object.values(PermissionStatus);

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
      value = defaultPermissionStatusValues;
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
      value = Object.values(PermissionStatus);
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
  const filterType = (column.columnDef.meta as any)?.filterType;
  switch (filterType) {
    case 'status':
      return Object.values(PodficStatus);
    case 'permission':
      return Object.values(PermissionStatus);
    case 'part_status':
      return Object.values(PartStatus);
    case 'rating':
      return Object.values(Rating);
    case 'type':
      return Object.values(PodficType);
    case 'string':
      return Array.from(column.getFacetedUniqueValues().keys()).sort();
    default:
      return [];
  }
};
