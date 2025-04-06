import { AccessTime, Close } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { formatDateString } from '../lib/format';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  onBlur?: () => void;
  forceUpdate?: (val: any) => void;
}

export default function DatePicker({
  value,
  onChange,
  label,
  onBlur,
  forceUpdate,
}: DatePickerProps) {
  return (
    <TextField
      size='small'
      type='date'
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onBlur={onBlur}
      label={label ?? 'Date'}
      slotProps={{
        inputLabel: {
          shrink: true,
        },
        input: {
          // TODO: make these not focusable?
          endAdornment: (
            <>
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => {
                    const date = formatDateString(new Date());
                    onChange(date);
                    forceUpdate?.(date);
                  }}
                >
                  <AccessTime />
                </IconButton>
              </InputAdornment>
              <InputAdornment position='end'>
                <IconButton
                  onClick={() => {
                    onChange('');
                    forceUpdate?.('');
                  }}
                >
                  <Close />
                </IconButton>
              </InputAdornment>
            </>
          ),
        },
      }}
    />
  );
}
