import { MenuItem, TextField } from '@mui/material';
import { PartStatus, PermissionStatus, PodficStatus } from '../types';
import StatusBadge from './StatusBadge';

// or subcomponents for type? eh
interface StatusSelectProps {
  value: string | PodficStatus | PermissionStatus;
  setValue: ((value: PodficStatus) => void) &
    ((value: PermissionStatus) => void) &
    ((value: PartStatus) => void);
  type: 'podfic' | 'permission' | 'part';
  label?: string;
}

export default function StatusSelect({
  value,
  setValue,
  type,
  label,
}: StatusSelectProps) {
  return (
    <TextField
      select
      size='small'
      sx={{
        width: '175px',
      }}
      label={label ?? 'Status'}
      value={value}
      onChange={(e) => {
        switch (type) {
          case 'podfic':
            setValue(e.target.value as PodficStatus);
            break;
          case 'permission':
            setValue(e.target.value as PermissionStatus);
            break;
          case 'part':
            setValue(e.target.value as PartStatus);
        }
      }}
    >
      {Object.values(
        type === 'permission'
          ? PermissionStatus
          : type === 'part'
          ? PartStatus
          : PodficStatus
      ).map((status) => (
        <MenuItem key={status} value={status}>
          <StatusBadge status={status} />
        </MenuItem>
      ))}
    </TextField>
  );
}
