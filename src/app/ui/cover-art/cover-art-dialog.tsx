import { createUpdateCoverArt } from '@/app/lib/updaters';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import CoverArtForm from './cover-art-form';
import { DialogProps } from '@/app/types';

interface CoverArtDialogProps extends DialogProps<CoverArt> {
  cover_art_id?: number | null;
  podfic_id: number;
  podficTitle?: string;
}

export default function CoverArtDialog({
  isOpen,
  onClose,
  submitCallback,
  cover_art_id = null,
  podfic_id,
  podficTitle = '',
}: CoverArtDialogProps) {
  // TODO: use cover art prop instead of fetching
  const [coverArt, setCoverArt] = useState({ podficcer_id: 1 } as CoverArt);

  useEffect(() => {
    const fetchCoverArt = async () => {
      const response = await fetch(`/db/coverart/${cover_art_id}`);
      const data = await response.json();
      setCoverArt(data);
    };

    if (cover_art_id) fetchCoverArt();
  }, [cover_art_id]);

  const submitCoverArt = useCallback(async () => {
    // console.log({ coverArt });
    try {
      const coverArtId = await createUpdateCoverArt({
        image_link: coverArt.image_link,
        cover_artist_name: coverArt.cover_artist_name,
        status: coverArt.cover_art_status,
        podficcer_id: coverArt.podficcer_id,
        podfic_id,
      });
      setCoverArt({} as CoverArt);
      submitCallback?.(coverArtId);
    } catch (e) {
      console.error('Error submitting cover art:', e);
    }
  }, [coverArt, submitCallback, podfic_id]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>
        {cover_art_id
          ? `Edit ${podficTitle ? `${podficTitle} ` : ''}Cover Art`
          : `New ${podficTitle ? `${podficTitle} ` : ''}Cover Art`}
      </DialogTitle>
      <DialogContent>
        <CoverArtForm coverArt={coverArt} setCoverArt={setCoverArt} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setCoverArt({} as CoverArt);
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button variant='contained' onClick={submitCoverArt}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
