import { ReactNode } from 'react';
import styles from '@/app/dashboard/dashboard.module.css';
import { IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

interface RemovableItemProps {
  removeCallback: () => void;
  children: ReactNode;
}

export default function RemovableItem({
  removeCallback,
  children,
}: RemovableItemProps) {
  // TODO: put him like at the top or something. he is very very long.
  return (
    <div
      className={styles.flexRow}
      style={{
        justifyContent: 'space-between',
      }}
    >
      {children}
      <IconButton onClick={removeCallback}>
        <Close />
      </IconButton>
    </div>
  );
}
