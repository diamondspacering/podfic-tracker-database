import {
  linkBingoSquareAndPodfic,
  unlinkBingoSquareAndPodfic,
} from '@/app/lib/updaters';
import { DialogProps } from '@/app/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import BingoFillsForm from './bingo-fills-form';

export default function BingoFillsDialog({
  item: bingoSquareProp,
  isOpen,
  onClose,
  submitCallback,
}: DialogProps<BingoSquare>) {
  // TODO: implement fill descriptions
  const [fills, setFills] = useState<(Podfic & Work & Fandom & Event)[]>(
    (bingoSquareProp.podfics ?? []) as (Podfic & Work & Fandom & Event)[],
  );

  const submitFills = useCallback(async () => {
    try {
      console.log({ bingoSquareProp });
      const originalPodfics =
        bingoSquareProp.podfics?.map((podfic) => podfic.podfic_id) ?? [];
      const newPodfics = fills.map((podfic) => podfic.podfic_id) ?? [];

      if (!originalPodfics.length && !newPodfics.length) {
        return;
      }

      const addedPodfics = newPodfics.filter(
        (podfic) => !originalPodfics.includes(podfic),
      );
      const removedPodfics = originalPodfics.filter(
        (podfic) => !newPodfics.includes(podfic),
      );

      console.log({ addedPodfics, removedPodfics });

      await Promise.all(
        addedPodfics.map((podfic) =>
          linkBingoSquareAndPodfic(
            bingoSquareProp.bingo_card_id,
            bingoSquareProp.row,
            bingoSquareProp.column,
            podfic,
            '',
          ),
        ),
      );
      await Promise.all(
        removedPodfics.map((podfic) =>
          unlinkBingoSquareAndPodfic(
            bingoSquareProp.bingo_card_id,
            bingoSquareProp.row,
            bingoSquareProp.column,
            podfic,
          ),
        ),
      );

      await submitCallback?.();
    } catch (e) {
      console.error('Cannot submit bingo fills:', e);
    }
  }, [bingoSquareProp, fills, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>Edit fills for {bingoSquareProp.title}</DialogTitle>
      <DialogContent>
        <BingoFillsForm fills={fills} setFills={setFills} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitFills}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
