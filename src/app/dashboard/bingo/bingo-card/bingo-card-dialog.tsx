import { createUpdateBingoCard } from '@/app/lib/updaters';
import { DialogProps } from '@/app/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import BingoCardForm from './bingo-card-form';

export default function BingoCardDialog({
  item: bingoCardProp,
  isOpen,
  onClose,
  submitCallback,
}: DialogProps<BingoCard>) {
  const [bingoCard, setBingoCard] = useState<BingoCard>(
    bingoCardProp ?? ({ size: 2, active: true } as BingoCard),
  );

  const submitBingoCard = useCallback(async () => {
    try {
      await createUpdateBingoCard(bingoCard);
      await submitCallback?.();
    } catch (e) {
      console.error('Error submitting bingo card', e);
    }
  }, [bingoCard, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>Add bingo card</DialogTitle>
      <DialogContent>
        <BingoCardForm card={bingoCard} setCard={setBingoCard} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitBingoCard}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
