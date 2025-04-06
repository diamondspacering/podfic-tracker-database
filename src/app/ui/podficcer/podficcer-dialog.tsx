import { createUpdatePodficcer } from '@/app/lib/updaters';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import PodficcerForm from './podficcer-form';

export default function PodficcerDialog({
  isOpen,
  onClose,
  submitCallback,
  podficcer: podficcerProp = null,
}) {
  const [podficcer, setPodficcer] = useState<Podficcer>(
    podficcerProp ?? ({} as Podficcer)
  );

  const submitPodficcer = useCallback(async () => {
    console.log({ podficcer });
    try {
      const newPodficcer = await createUpdatePodficcer(podficcer);
      await mutate('/db/podficcers');
      submitCallback?.(newPodficcer);
      setPodficcer({} as Podficcer);
    } catch (e) {
      console.error('Error submitting podficcer:', e);
    }
  }, [podficcer, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>
        {podficcer.podficcer_id ? 'Edit Podficcer' : 'New Podficcer'}
      </DialogTitle>
      <DialogContent>
        <PodficcerForm podficcer={podficcer} setPodficcer={setPodficcer} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setPodficcer({} as Podficcer);
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button variant='contained' onClick={submitPodficcer}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
