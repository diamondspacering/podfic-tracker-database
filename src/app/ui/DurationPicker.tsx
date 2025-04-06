import { TextField } from '@mui/material';
import styles from '@/app/forms/forms.module.css';

interface DurationPickerProps {
  value: Length;
  onChange: (value: Length) => void;
  onBlur?: () => void;
}

export default function DurationPicker({
  value,
  onChange,
  onBlur,
}: DurationPickerProps) {
  return (
    <div className={styles.flexRow}>
      <TextField
        size='small'
        placeholder='0'
        sx={{
          width: '80px',
          textAlign: 'right',
        }}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        type='number'
        label='Hours'
        value={value.hours}
        onChange={(e) =>
          onChange({ ...value, hours: parseInt(e.target.value) })
        }
        onBlur={onBlur}
      />
      <TextField
        size='small'
        placeholder='0'
        sx={{
          width: '80px',
        }}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        type='number'
        label='Minutes'
        value={value.minutes}
        onChange={(e) =>
          onChange({ ...value, minutes: parseInt(e.target.value) })
        }
        onBlur={onBlur}
      />
      <TextField
        size='small'
        placeholder='0'
        sx={{
          width: '80px',
        }}
        slotProps={{
          inputLabel: {
            shrink: true,
          },
        }}
        type='number'
        label='Seconds'
        value={value.seconds}
        onChange={(e) =>
          onChange({ ...value, seconds: parseInt(e.target.value) })
        }
        onBlur={onBlur}
      />
    </div>
  );
}
