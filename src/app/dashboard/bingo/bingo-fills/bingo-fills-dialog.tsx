import {
  createUpdateBingoFill,
  createUpdateBingoSquare,
  deleteBingoFill,
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
  const [fills, setFills] = useState<BingoFill[]>(
    (bingoSquareProp.fills ?? []) as BingoFill[],
  );

  const getDefaultFill = useCallback(
    (): BingoFill => ({
      bingo_card_id: bingoSquareProp.bingo_card_id,
      row: bingoSquareProp.row,
      column: bingoSquareProp.column,
      podfic_id: -1,
    }),
    [
      bingoSquareProp.bingo_card_id,
      bingoSquareProp.column,
      bingoSquareProp.row,
    ],
  );

  const submitFills = useCallback(async () => {
    try {
      console.log({ bingoSquareProp });
      const originalFills = bingoSquareProp.fills ?? [];

      if (!originalFills.length && !fills.length) {
        return;
      }

      const fillIds = fills.map((fill) => fill.bingo_fill_id);
      const removedFillIds = originalFills
        .map((fill) => fill.bingo_fill_id)
        .filter(Boolean)
        .filter((fill) => !fillIds.includes(fill));

      await Promise.all(fills.map((fill) => createUpdateBingoFill(fill)));
      await Promise.all(
        removedFillIds.map((fillId) => deleteBingoFill(fillId)),
      );

      const completesPodfic = fills.some((fill) => fill.completed);
      if (completesPodfic && !bingoSquareProp.filled) {
        await createUpdateBingoSquare({ ...bingoSquareProp, filled: true });
      } else if (!completesPodfic && !!bingoSquareProp.filled) {
        await createUpdateBingoSquare({ ...bingoSquareProp, filled: false });
      }

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
        <BingoFillsForm
          fills={fills}
          setFills={setFills}
          getDefaultFill={getDefaultFill}
        />
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
