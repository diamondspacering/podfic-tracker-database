import { createUpdateEvent } from '@/app/lib/updaters';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import EventForm from './event-form';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submitCallback?: (val: Event) => void;
  submitParentCallback?: () => void;
  eventId?: number;
  // TODO: improve being able to pass this
  eventParentId?: number;
  parents?: EventParent[];
}

export default function EventDialog({
  isOpen,
  onClose,
  submitCallback,
  submitParentCallback,
  eventId,
  parents,
}: EventDialogProps) {
  const [event, setEvent] = useState<Event>({} as Event);

  const submitEvent = useCallback(async () => {
    try {
      const newEvent = await createUpdateEvent(event);
      setEvent({} as Event);
      submitCallback?.(newEvent);
    } catch (e) {
      console.error('Error submitting event:', e);
    }
  }, [event, submitCallback]);

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{eventId ? 'New Event' : 'Edit Event'}</DialogTitle>
      <DialogContent>
        <EventForm
          event={event}
          setEvent={setEvent}
          parents={parents}
          submitParentCallback={submitParentCallback}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitEvent}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
