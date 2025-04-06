import styles from '@/app/forms/forms.module.css';
import { createUpdateEventParent } from '@/app/lib/updaters';
import {
  Autocomplete,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Check } from '@mui/icons-material';

// TODO: I was having Problems making this, try improving data fetching & revalidation (just swr it)
export default function EventForm({
  event,
  setEvent,
  parents = [],
  submitParentCallback,
}: {
  event: Event;
  setEvent: React.Dispatch<React.SetStateAction<Event>>;
  parents?: EventParent[];
  submitParentCallback: () => void;
}) {
  const [eventParents, setEventParents] = useState<EventParent[]>([]);
  const [parentsLoading, setParentsLoading] = useState(true);

  const [isNewParent, setIsNewParent] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentDescription, setParentDescription] = useState('');

  const fetchEventParents = useCallback(async () => {
    setParentsLoading(true);
    try {
      const response = await fetch('/db/events?parents_only=true');
      console.log({ response });
      const data = await response.json();
      console.log({ data });
      console.log('setting event parents');
      setEventParents(data);
    } catch (e) {
      console.error('Error fetching event parents:', e);
    } finally {
      setParentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventParents();
  }, []);

  // TODO: submitting state for it?
  const submitParent = useCallback(async () => {
    try {
      const parentId = await createUpdateEventParent({
        name: parentName,
        description: parentDescription,
      });
      console.log({ parentId });
      setEvent((prev) => ({ ...prev, parent_id: parentId }));
      await fetchEventParents();
      // await submitParentCallback?.();
      setIsNewParent(false);
    } catch (e) {
      console.error('Error submitting new event parent:', e);
    }
  }, [parentName, parentDescription, setEvent, fetchEventParents]);

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <RadioGroup
        name='is-new-parent'
        value={isNewParent ? 'new' : 'existing'}
        onChange={(e) =>
          e.target.value === 'new'
            ? setIsNewParent(true)
            : setIsNewParent(false)
        }
      >
        <FormControlLabel
          label='Existing event parent'
          control={<Radio value='existing' />}
        />
        <FormControlLabel
          label='New event parent'
          control={<Radio value='new' />}
        />
      </RadioGroup>
      {isNewParent ? (
        <div className={styles.flexRow}>
          <TextField
            size='small'
            label='Event Parent Name'
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
          />
          <TextField
            multiline
            size='small'
            label='Event Parent Description'
            value={parentDescription}
            onChange={(e) => setParentDescription(e.target.value)}
          />
          <Button onClick={submitParent}>
            <Check />
          </Button>
        </div>
      ) : (
        <Autocomplete
          size='small'
          sx={{
            width: '300px',
          }}
          loading={parentsLoading}
          options={eventParents}
          value={
            eventParents?.find(
              (parent) => parent.event_parent_id === event.parent_id
            ) ?? {
              event_parent_id: 0,
              name: '',
            }
          }
          getOptionLabel={(option) => option?.name ?? '(unknown)'}
          onChange={(_, newValue) => {
            console.log({ newValue });
            setEvent((prev) => ({
              ...prev,
              parent_id: newValue?.event_parent_id ?? null,
            }));
          }}
          renderInput={(params) => (
            <TextField
              size='small'
              {...params}
              label='Event Parent&nbsp;&nbsp;&nbsp;'
            />
          )}
        />
      )}
      <TextField
        size='small'
        label='Name'
        value={event.name}
        onChange={(e) =>
          setEvent((prev) => ({ ...prev, name: e.target.value }))
        }
      />
      {/* TODO: this seems like a weird way to handle this tbh */}
      <TextField
        size='small'
        label='Year'
        value={
          typeof event.year === 'number' ? event.year.toString() : event.year
        }
        onChange={(e) =>
          setEvent((prev) => ({ ...prev, year: e.target.value }))
        }
      />
    </div>
  );
}
