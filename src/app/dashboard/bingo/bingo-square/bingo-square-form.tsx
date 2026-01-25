import { Dispatch, SetStateAction, useCallback } from 'react';
import styles from '@/app/forms/forms.module.css';
import { Button, TextField, Typography } from '@mui/material';

interface BingoSquareFormProps {
  square: BingoSquare;
  setSquare: Dispatch<SetStateAction<BingoSquare>>;
  submitCallback: () => void;
}

export default function BingoSquareForm({
  square,
  setSquare,
  submitCallback,
}: BingoSquareFormProps) {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Enter') submitCallback();
    },
    [submitCallback],
  );

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <Button variant='contained' onClick={() => console.log(square)}>
        log
      </Button>
      <Typography variant='body1'>
        Row: {square.row}, Column: {square.column}
      </Typography>
      <TextField
        size='small'
        label='Title'
        required
        autoFocus
        onKeyDown={handleKeyDown}
        value={square.title ?? ''}
        onChange={(e) =>
          setSquare((prev) => ({ ...prev, title: e.target.value }))
        }
      />
      <TextField
        size='small'
        label='Link'
        onKeyDown={handleKeyDown}
        value={square.title_link ?? ''}
        onChange={(e) =>
          setSquare((prev) => ({ ...prev, title_link: e.target.value }))
        }
      />
      <TextField
        size='small'
        label='Description'
        onKeyDown={handleKeyDown}
        value={square.description ?? ''}
        onChange={(e) =>
          setSquare((prev) => ({ ...prev, description: e.target.value }))
        }
      />
    </div>
  );
}
