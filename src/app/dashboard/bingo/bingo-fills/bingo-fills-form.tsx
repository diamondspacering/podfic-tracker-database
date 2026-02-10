import RemovableItem from '@/app/forms/podfic/RemovableItem';
import { usePodficsFull } from '@/app/lib/swrLoaders';
import { Add } from '@mui/icons-material';
import {
  Autocomplete,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { Dispatch, SetStateAction } from 'react';
import styles from '@/app/forms/forms.module.css';

interface BingoFillsFormProps {
  fills: BingoFill[];
  setFills: Dispatch<SetStateAction<BingoFill[]>>;
  getDefaultFill: () => BingoFill;
}

export default function BingoFillsForm({
  fills,
  setFills,
  getDefaultFill,
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
          <div className={styles.flexColumn}>
            <RadioGroup
              name='is-podfic'
              value={fill.podfic_id ? 'podfic' : 'manual'}
              onChange={(e) => {
                if (e.target.value === 'podfic')
                  setFills((prev) =>
                    prev.map((f, fi) =>
                      i === fi ? { ...f, podfic_id: -1 } : f,
                    ),
                  );
                else
                  setFills((prev) =>
                    prev.map((f, fi) =>
                      i === fi ? { ...f, podfic_id: null } : f,
                    ),
                  );
              }}
            >
              <FormControlLabel
                label='Podfic I am in'
                value='podfic'
                control={<Radio />}
              />
              <FormControlLabel
                label='Manual'
                value='manual'
                control={<Radio />}
              />
            </RadioGroup>
            {fill.podfic_id ? (
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
                getOptionLabel={(option) => option.title ?? ''}
                value={podfics.find(
                  (podfic) => podfic.podfic_id === fill.podfic_id,
                )}
                onChange={(_, newValue) => {
                  setFills((prev) =>
                    prev.map((f, fi) =>
                      i === fi
                        ? {
                            ...f,
                            podfic_id: newValue.podfic_id,
                            podfic_title: newValue.title,
                          }
                        : f,
                    ),
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size='small'
                    label='Podfic&nbsp;&nbsp;'
                  />
                )}
              />
            ) : (
              <></>
            )}
            <TextField
              size='small'
              label='Title'
              value={fill.title ?? fill.podfic_title ?? ''}
              onChange={(e) =>
                setFills((prev) =>
                  prev.map((f, fi) =>
                    i === fi ? { ...f, title: e.target.value } : f,
                  ),
                )
              }
            />
            <TextField
              size='small'
              label='Description'
              value={fill.description ?? ''}
              onChange={(e) =>
                setFills((prev) =>
                  prev.map((f, fi) =>
                    i === fi ? { ...f, description: e.target.value } : f,
                  ),
                )
              }
            />
            <FormControlLabel
              label='Completed?'
              control={
                <Checkbox
                  checked={fill.completed}
                  onChange={(e) =>
                    setFills((prev) =>
                      prev.map((f, fi) =>
                        i === fi ? { ...f, completed: e.target.checked } : f,
                      ),
                    )
                  }
                />
              }
            />
          </div>
        </RemovableItem>
      ))}
      <Button
        variant='contained'
        startIcon={<Add />}
        onClick={() => setFills((prev) => [...prev, getDefaultFill()])}
      >
        Add fill
      </Button>
    </div>
  );
}
