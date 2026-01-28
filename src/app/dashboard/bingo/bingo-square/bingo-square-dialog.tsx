import { createUpdateBingoSquare } from '@/app/lib/updaters';
import { DialogProps } from '@/app/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import BingoSquareForm from './bingo-square-form';

interface BingoSquareDialogProps extends DialogProps<BingoSquare> {
  title?: string;
}

export default function BingoSquareDialog({
  title,
  item: bingoSquareProp,
  isOpen,
  onClose,
  submitCallback,
}: BingoSquareDialogProps) {
  const [bingoSquare, setBingoSquare] = useState<BingoSquare>(bingoSquareProp);

  const submitBingoSquare = useCallback(async () => {
    try {
      await createUpdateBingoSquare(bingoSquare);
      await submitCallback?.();
    } catch (e) {
      console.error('Error submitting bingo square', e);
    }
  }, [bingoSquare, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>
        {`Add bingo square${title ? `for ${title}` : ''}`}
      </DialogTitle>
      <DialogContent>
        <BingoSquareForm
          square={bingoSquare}
          setSquare={setBingoSquare}
          submitCallback={submitBingoSquare}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitBingoSquare}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
