import { Dispatch, SetStateAction, useMemo } from 'react';
import styles from '@/app/forms/forms.module.css';
import { Button, Checkbox, FormControlLabel, TextField } from '@mui/material';

interface BingoCardFormProps {
  card: BingoCard;
  setCard: Dispatch<SetStateAction<BingoCard>>;
}

export default function BingoCardForm({ card, setCard }: BingoCardFormProps) {
  const size = useMemo(() => card.size.toString(), [card.size]);

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <Button variant='contained' onClick={() => console.log(card)}>
        log
      </Button>
      <TextField
        size='small'
        label='Title'
        value={card.title ?? ''}
        onChange={(e) =>
          setCard((prev) => ({ ...prev, title: e.target.value }))
        }
      />
      {/* TODO: enforce being no smaller than 2 */}
      <TextField
        size='small'
        label='Size'
        value={size}
        onChange={(e) =>
          setCard((prev) => ({ ...prev, size: parseInt(e.target.value) }))
        }
      />
      {/* TODO: event select */}
      <FormControlLabel
        label='Active?'
        control={
          <Checkbox
            checked={card.active ?? false}
            onChange={(e) =>
              setCard((prev) => ({ ...prev, active: e.target.checked }))
            }
          />
        }
      />
    </div>
  );
}
