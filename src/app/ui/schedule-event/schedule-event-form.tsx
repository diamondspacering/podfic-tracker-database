import {
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import styles from '@/app/forms/forms.module.css';
import { ScheduleEventType } from '@/app/types';
import {
  usePartsForPodfic,
  usePodficsMinimal,
  useRounds,
  useVoiceteams,
} from '@/app/lib/swrLoaders';
import DatePicker from '../DatePicker';

interface ScheduleEventFormProps {
  scheduleEvent: ScheduleEvent;
  setScheduleEvent: Dispatch<SetStateAction<ScheduleEvent>>;
}

export default function ScheduleEventForm({
  scheduleEvent,
  setScheduleEvent,
}: ScheduleEventFormProps) {
  const [selectedVoiceteamId, setSelectedVoiceteamId] = useState<null | number>(
    null,
  );
  // TODO: use smart determination to see if it's just end of day or not
  const [showTime, setShowTime] = useState(false);

  const { voiceteams, isLoading: voiceteamsLoading } = useVoiceteams({});
  const { rounds, isLoading: roundsLoading } = useRounds({
    voiceteamId: selectedVoiceteamId,
  });
  const { podfics, isLoading: podficsLoading } = usePodficsMinimal();
  const { parts, isLoading: partsLoading } = usePartsForPodfic({
    podficId: scheduleEvent.podfic_id ?? null,
  });

  const showPodficSelect = useMemo(
    () =>
      scheduleEvent.type === ScheduleEventType.PODFIC ||
      scheduleEvent.type === ScheduleEventType.SECTION ||
      scheduleEvent.type === ScheduleEventType.PART,
    [scheduleEvent.type],
  );

  useEffect(() => {
    const getVoiceteamIdFromRound = async (roundId) => {
      const response = await fetch(`/db/rounds/${roundId}`);
      const data = await response.json();
      setSelectedVoiceteamId(data?.voiceteam_event_id ?? null);
    };

    if (scheduleEvent.round_id && !selectedVoiceteamId) {
      // find round and set it from there. do we fetch directly or smth? obviously more efficient than loading all rounds
      getVoiceteamIdFromRound(scheduleEvent.round_id);
    }
  }, [scheduleEvent.round_id, selectedVoiceteamId]);

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <TextField
        size='small'
        label='Title'
        value={scheduleEvent.title ?? ''}
        onChange={(e) =>
          setScheduleEvent((prev) => ({ ...prev, title: e.target.value }))
        }
      />
      {/* label that says this is type - legend? */}
      <RadioGroup
        name='type'
        value={scheduleEvent.type}
        onChange={(e) =>
          setScheduleEvent((prev) => ({
            ...prev,
            type: e.target.value as ScheduleEventType,
          }))
        }
      >
        {Object.values(ScheduleEventType).map((type) => (
          <FormControlLabel
            key={type}
            label={type}
            value={type}
            control={<Radio />}
          />
        ))}
      </RadioGroup>
      {scheduleEvent.type === ScheduleEventType.ROUND && (
        <>
          {/* select vts, then select round */}
          <Autocomplete
            size='small'
            sx={{
              width: '300px',
            }}
            options={voiceteams}
            loading={voiceteamsLoading}
            isOptionEqualToValue={(option, value) =>
              option.voiceteam_event_id === value.voiceteam_event_id
            }
            getOptionLabel={(option) => option.name}
            value={voiceteams.find(
              (vt) => vt.voiceteam_event_id === selectedVoiceteamId,
            )}
            onChange={(_, newValue) =>
              setSelectedVoiceteamId(newValue?.voiceteam_event_id ?? null)
            }
            renderInput={(params) => (
              <TextField {...params} size='small' label='Voiceteam' />
            )}
          />
          <Autocomplete
            size='small'
            sx={{
              width: '150px',
            }}
            options={rounds}
            loading={roundsLoading}
            isOptionEqualToValue={(option, value) =>
              option.round_id === value.round_id
            }
            getOptionLabel={(option) => option.name}
            value={rounds.find(
              (round) => round.round_id === scheduleEvent.round_id,
            )}
            onChange={(_, newValue) =>
              setScheduleEvent((prev) => ({
                ...prev,
                round_id: newValue?.round_id ?? null,
              }))
            }
            renderInput={(params) => (
              <TextField {...params} size='small' label='Round' />
            )}
          />
        </>
      )}
      {/* TODO: maybe reusable podfic & chapter/section selector? */}
      {showPodficSelect && (
        <Autocomplete
          size='small'
          sx={{
            width: '300px',
          }}
          options={podfics}
          loading={podficsLoading}
          isOptionEqualToValue={(option, value) =>
            option.podfic_id === value.podfic_id
          }
          getOptionLabel={(option) => option.title}
          value={podfics.find(
            (podfic) => podfic.podfic_id === scheduleEvent.podfic_id,
          )}
          onChange={(_, newValue) =>
            setScheduleEvent((prev) => ({
              ...prev,
              podfic_id: newValue?.podfic_id ?? null,
            }))
          }
          renderInput={(params) => (
            <TextField {...params} size='small' label='Podfic' />
          )}
        />
      )}
      {/* TODO: logic for proper sections */}
      {scheduleEvent.type === ScheduleEventType.SECTION &&
        !!scheduleEvent.podfic_id && <Typography>Coming soon</Typography>}
      {scheduleEvent.type === ScheduleEventType.PART &&
        !!scheduleEvent.part_id && (
          <Autocomplete
            size='small'
            sx={{
              width: '300px',
            }}
            options={parts}
            loading={partsLoading}
            isOptionEqualToValue={(option, value) =>
              option.part_id === value.part_id
            }
            getOptionLabel={(option) => option.part}
            value={parts.find((part) => part.part_id === scheduleEvent.part_id)}
            onChange={(_, newValue) =>
              setScheduleEvent((prev) => ({
                ...prev,
                part_id: newValue?.part_id ?? null,
              }))
            }
            renderInput={(params) => (
              <TextField {...params} size='small' label='Part' />
            )}
          />
        )}

      <FormControlLabel
        label='Specify time of day?'
        control={
          <Checkbox
            checked={showTime}
            onChange={(e) => setShowTime(e.target.checked)}
          />
        }
      />
      {/* timezones? */}
      <DatePicker
        label='Due date'
        value={
          scheduleEvent.end
            ? typeof scheduleEvent.end === 'string'
              ? scheduleEvent.end
              : scheduleEvent.end.toISOString()
            : ''
        }
        showTime={showTime}
        onChange={(value) =>
          setScheduleEvent((prev) => ({ ...prev, end: value }))
        }
      />
    </div>
  );
}
