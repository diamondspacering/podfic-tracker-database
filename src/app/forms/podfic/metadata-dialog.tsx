import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { WorkMetadata } from './metadataHelpers';
import { useCallback, useState } from 'react';
import { TagMappings } from '@/app/lib/swrLoaders';
import MetadataForm from './metadata-form';
import { LoadingButton } from '@mui/lab';

interface MetadataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: WorkMetadata;
  tagMappings: TagMappings;
  submitCallback: (metadata: WorkMetadata) => void;
  workUrl: string;
}

export default function MetadataDialog({
  isOpen,
  onClose,
  metadata: metadataProp,
  tagMappings: tagMappingsProp,
  submitCallback,
  workUrl,
}: MetadataDialogProps) {
  const [metadata, setMetadata] = useState<WorkMetadata & Work>({
    ...metadataProp,
    link: workUrl,
  });
  const [localTagMappings, setLocalTagMappings] =
    useState<TagMappings>(tagMappingsProp);
  const [submitting, setSubmitting] = useState(false);

  const submitMetadata = useCallback(async () => {
    console.log('submitting metadata');
    setSubmitting(true);
    try {
      await fetch('/db/metadata/tagmappings', {
        method: 'PATCH',
        body: JSON.stringify(localTagMappings),
      });
      submitCallback(metadata);
    } catch (e) {
      console.error('Error submitting metadata', e);
    } finally {
      setSubmitting(false);
    }
  }, [localTagMappings, metadata, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      fullWidth
    >
      <DialogTitle>Import Work Metadata</DialogTitle>
      <DialogContent>
        <MetadataForm
          metadata={metadata}
          setMetadata={setMetadata}
          tagMappings={tagMappingsProp}
          localTagMappings={localTagMappings}
          setLocalTagMappings={setLocalTagMappings}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          variant='contained'
          loading={submitting}
          onClick={submitMetadata}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
