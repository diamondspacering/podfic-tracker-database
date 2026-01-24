import RemovableItem from '@/app/forms/podfic/RemovableItem';
import { usePodficsFull } from '@/app/lib/swrLoaders';
import { PodficType } from '@/app/types';
import { Add } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  CircularProgress,
  TextField,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import styles from '@/app/forms/forms.module.css';

interface BingoFillsFormProps {
  fills: (Podfic & Work & Fandom & Event)[];
  setFills: Dispatch<SetStateAction<(Podfic & Work & Fandom & Event)[]>>;
}

export default function BingoFillsForm({
  fills,
  setFills,
}: BingoFillsFormProps) {
  const { podfics, isLoading } = usePodficsFull({});

  if (isLoading) return <CircularProgress />;

  return (
    <div className={styles.flexColumn}>
      {fills.map((fill, i) => (
        <RemovableItem
          key={fill.podfic_id}
          removeCallback={() =>
            setFills((prev) => prev.filter((_p, pi) => pi !== i))
          }
        >
          <Autocomplete
            loading={isLoading}
            sx={{
              width: '500px',
            }}
            slotProps={{
              popper: {
                style: {
                  width: 'fit-content',
                  minWidth: '500px',
                },
              },
            }}
            options={podfics}
            getOptionLabel={(option) => option.title ?? null}
            value={
              fills.find((podfic) => podfic.podfic_id === fill.podfic_id) ??
              ({ type: PodficType.PODFIC } as Podfic & Work & Fandom & Event)
            }
            onChange={(_, newValue) => {
              setFills((prev) =>
                prev.map((p, pi) => (pi === i ? newValue : p)),
              );
            }}
            renderInput={(params) => (
              <TextField {...params} size='small' label={null} />
            )}
          />
        </RemovableItem>
      ))}
      <Button
        variant='contained'
        startIcon={<Add />}
        onClick={() =>
          setFills((prev) => [...prev, {} as Podfic & Work & Fandom & Event])
        }
      >
        Add fill
      </Button>
    </div>
  );
}
