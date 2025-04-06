import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import ResourceForm from './resource-form';
import { createUpdateResource } from '@/app/lib/updaters';

interface ResourceDialogProps {
  resourceId?: number;
  resource?: Resource;
  podfic_id?: number;
  chapter_id?: number;
  event_id?: number;
  author_id?: number;
  isOpen: boolean;
  onClose?: () => void;
  submitCallback?: () => void;
}

export default function ResourceDialog({
  resourceId,
  resource: resourceProp,
  podfic_id,
  chapter_id,
  event_id,
  author_id,
  isOpen,
  onClose,
  submitCallback,
}: ResourceDialogProps) {
  const [resource, setResource] = useState<Resource>(
    resourceProp ?? ({} as Resource)
  );

  useEffect(
    () => setResource(resourceProp ?? ({} as Resource)),
    [resourceProp]
  );

  // TODO: loading state
  useEffect(() => {
    const fetchResource = async () => {
      const response = await fetch(`/db/resources/${resourceId}`);
      const data = await response.json();
      setResource(data);
    };

    if (resourceId && !resourceProp) fetchResource();
  }, [resourceId, resourceProp]);

  const submitResource = useCallback(async () => {
    try {
      await createUpdateResource({
        resourceData: resource,
        podfic_id,
        chapter_id,
        event_id,
        author_id,
      });
      setResource({} as Resource);
      await submitCallback?.();
    } catch (e) {
      console.error('Error submitting resource:', e);
    }
  }, [author_id, chapter_id, event_id, podfic_id, resource, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>
        {resourceId || !!resourceProp ? 'Edit Resource' : 'New Resource'}
      </DialogTitle>
      <DialogContent>
        <ResourceForm resource={resource} setResource={setResource} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setResource({} as Resource);
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button variant='contained' onClick={submitResource}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
