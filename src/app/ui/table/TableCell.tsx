import { useEffect, useState } from 'react';
import StatusBadge from '../StatusBadge';
import { getLengthText, getLengthValue } from '@/app/lib/format';
import tableStyles from './table.module.css';
import { MenuItem, TextField } from '@mui/material';
import {
  getDefaultLength,
  PartStatus,
  PermissionStatus,
  PodficStatus,
} from '@/app/types';
import DurationPicker from '../DurationPicker';
import DatePicker from '../DatePicker';
import { sourceCodePro } from '@/app/fonts/fonts';

type Option = {
  label: string;
  value: string;
};

// CellContext<any, any>
export const TableCell = ({
  getValue,
  row,
  column,
  table,
  extraFieldParams = {},
}) => {
  const initialValue = getValue();
  const columnMeta = column.columnDef.meta as any;
  const tableMeta = table.options.meta as any;
  const isExpanded = row.getIsExpanded();

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  if (tableMeta?.editingRowId === row.id && !columnMeta?.immutable) {
    return (
      <EditableCell
        value={value}
        setValue={setValue}
        columnMeta={columnMeta}
        tableMeta={tableMeta}
        rowId={row.id}
        columnId={column.id}
        extraFieldParams={extraFieldParams}
      />
    );
  } else {
    return (
      <DisplayCell value={value} meta={columnMeta} isExpanded={isExpanded} />
    );
  }
};

const EditableCell = ({
  value,
  setValue,
  columnMeta,
  tableMeta,
  rowId,
  columnId,
  extraFieldParams,
}) => {
  const onBlur = () => {
    // console.log('blur, updating data');
    // console.log({ value });
    tableMeta?.updateData(rowId, columnId, value);
  };

  const forceUpdate = (val) => {
    // console.log('forcing value update with val:', val);
    tableMeta?.updateData(rowId, columnId, val);
  };

  switch (columnMeta?.type) {
    case 'status':
      return (
        <TextField
          select
          size='small'
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            tableMeta?.updateData(rowId, columnId, e.target.value);
          }}
          sx={{
            width: '175px',
          }}
          label='Status'
          {...extraFieldParams}
        >
          {columnMeta?.statusType === 'permission'
            ? Object.values(PermissionStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  <StatusBadge status={status} />
                </MenuItem>
              ))
            : columnMeta?.statusType === 'part'
            ? Object.values(PartStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  <StatusBadge status={status} />
                </MenuItem>
              ))
            : Object.values(PodficStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  <StatusBadge status={status} />
                </MenuItem>
              ))}
        </TextField>
      );
    case 'length':
      return (
        <DurationPicker
          value={value ?? getDefaultLength()}
          onChange={(val) => setValue(val)}
          onBlur={onBlur}
        />
      );
    case 'date':
      return (
        <DatePicker
          value={value}
          onChange={(val) => setValue(val)}
          onBlur={onBlur}
          forceUpdate={forceUpdate}
          label={tableMeta?.columnId}
        />
      );
    case 'select':
      return (
        <TextField
          select
          size='small'
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            tableMeta?.updateData(rowId, columnId, e.target.value);
          }}
          sx={{
            width: columnMeta?.width ?? '175px',
          }}
          label={columnMeta?.label ?? columnId}
          {...extraFieldParams}
        >
          {columnMeta?.options.map((option: Option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      );
    default:
      return (
        <TextField
          size='small'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={onBlur}
          {...extraFieldParams}
        />
      );
  }
};

const DisplayCell = ({ value, meta, isExpanded }) => {
  switch (meta?.type) {
    case 'status':
      return <StatusBadge status={value} />;
    case 'length':
      return (
        <span
          className={tableStyles.tableCell}
          style={{
            backgroundColor:
              meta?.colorScale?.getColor(getLengthValue(value)).toHexString() ??
              'none',
            width: '100%',
            height: '100%',
          }}
        >
          {getLengthText(value)}
        </span>
      );
    case 'link':
      return (
        <span className={`${tableStyles.linkCell} ${meta.className ?? ''}`}>
          <a href={value} onClick={(e) => e.stopPropagation()} target='_blank'>
            {value}
          </a>
        </span>
      );
    case 'date':
    case 'small':
      return (
        <span
          className={`${sourceCodePro.className} ${tableStyles.smallText} ${tableStyles.alignRight}`}
        >
          {value}
        </span>
      );
    case 'text':
      return (
        <span
          className={`${tableStyles.tableCell} ${
            isExpanded ? '' : tableStyles.longTextCell
          }`}
          style={{
            maxWidth: meta?.maxWidth ?? '500px',
          }}
        >
          {value}
        </span>
      );
    case 'text-block':
      return (
        <span
          className={tableStyles.tableCell}
          style={{
            maxWidth: meta?.maxWidth ?? '500px',
          }}
        >
          {value}
        </span>
      );
    case 'colorScale':
      return (
        <span
          className={`${tableStyles.tableCell} ${tableStyles.colorScaleCell}`}
          {...(meta?.colorScale
            ? {
                style: {
                  backgroundColor: meta.colorScale
                    .getColor(value)
                    .toHexString(),
                },
              }
            : {})}
        >
          {value}
        </span>
      );
    default:
      return meta?.maxWidth ? (
        <span
          className={`${tableStyles.tableCell} ${tableStyles.textCell}`}
          style={{ maxWidth: meta.maxWidth }}
        >
          {value}
        </span>
      ) : (
        <span className={`${tableStyles.tableCell} ${tableStyles.textCell}`}>
          {value}
        </span>
      );
  }
};
