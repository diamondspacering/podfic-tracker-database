import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import styles from '@/app/forms/forms.module.css';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { useEvents } from '@/app/lib/swrLoaders';

interface BingoCardFormProps {
  card: BingoCard;
  setCard: Dispatch<SetStateAction<BingoCard>>;
}

export default function BingoCardForm({ card, setCard }: BingoCardFormProps) {
  const size = useMemo(() => card.size.toString(), [card.size]);

  const { events, isLoading: eventsLoading } = useEvents({
    childrenFirst: true,
  });

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
      <Autocomplete
        size='small'
        options={events}
        loading={eventsLoading}
        isOptionEqualToValue={(option, value) => {
          return option.event_id === value.event_id;
        }}
        value={events?.find((event) => event.event_id === card.event_id)}
        sx={{
          width: '300px',
        }}
        getOptionLabel={(option) =>
          option?.name ? `${option?.name} ${option?.year}` : ''
        }
        groupBy={(option) => option?.parent_name ?? '(unknown parent)'}
        onChange={(_, newValue) =>
          setCard((prev) => ({ ...prev, event_id: newValue?.event_id ?? null }))
        }
        renderInput={(params) => (
          <TextField {...params} size='small' label='Event&nbsp;&nbsp;' />
        )}
      />
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
