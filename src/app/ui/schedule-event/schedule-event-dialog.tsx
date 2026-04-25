import { createUpdateScheduleEvent } from '@/app/lib/updaters';
import { DialogProps } from '@/app/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useState } from 'react';
import ScheduleEventForm from './schedule-event-form';

interface ScheduleEventDialogProps extends DialogProps<ScheduleEvent> {
  date?: string;
}

export default function ScheduleEventDialog({
  item: scheduleEventProp,
  date,
  isOpen,
  onClose,
  submitCallback,
}: ScheduleEventDialogProps) {
  const [scheduleEvent, setScheduleEvent] = useState<ScheduleEvent>(
    scheduleEventProp ?? ({ start: date, end: date } as ScheduleEvent),
  );

  const submitScheduleEvent = useCallback(async () => {
    try {
      // TODO: loader
      await createUpdateScheduleEvent(scheduleEvent);
      await submitCallback?.();
    } catch (e) {
      console.error('Error submitting schedule event', e);
    }
  }, [scheduleEvent, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>
        {!!scheduleEventProp ? 'Edit Schedule Event' : 'New Schedule Event'}
      </DialogTitle>
      <DialogContent>
        <ScheduleEventForm
          scheduleEvent={scheduleEvent}
          setScheduleEvent={setScheduleEvent}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitScheduleEvent}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
