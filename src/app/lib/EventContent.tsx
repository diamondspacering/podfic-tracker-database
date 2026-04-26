import { DateTime } from 'luxon';
import { ScheduleEventType } from '../types';
import { IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';

// }
interface EventContentProps {
  scheduleEvent: ScheduleEvent;
  editEvent: () => void;
}

export default function EventContent({
  scheduleEvent,
  editEvent,
}: EventContentProps) {
  const {
    end,
    type,
    title,
    work_title,
    wordcount,
    status,
    section_number,
    section_title,
    section_wordcount,
    section_status,
    part,
    part_status,
    round_number,
  } = scheduleEvent;

  return (
    <div
      style={{
        maxWidth: '350px',
        textWrap: 'wrap',
        position: 'relative',
      }}
    >
      <IconButton
        style={{ padding: '0px', position: 'absolute', right: '0' }}
        onClick={(e) => {
          e.stopPropagation();
          editEvent();
        }}
      >
        <Edit style={{ width: '75%' }} />
      </IconButton>
      {/* TODO: this used to have just title, use that somewhere */}
      {work_title && (
        <>
          <span>{work_title}</span>
          <br />
        </>
      )}
      {type === ScheduleEventType.ROUND && (
        <>
          <span>
            Voiceteam Round {round_number} ends,{' '}
            {DateTime.fromISO(end as string).toLocaleString(
              DateTime.TIME_SIMPLE,
            )}
          </span>
          <br />
        </>
      )}
      {/* TODO: how to correctly convey chapter information w/ sections? */}
      {type === ScheduleEventType.SECTION && (
        <span>
          {`Section ${section_number}`}
          {section_title ? ` - ${section_title}` : ''}
          {`, ${section_wordcount ?? '?'}, ${section_status}`}
        </span>
      )}
      {type === ScheduleEventType.PART && (
        <span>
          {part},&nbsp;{section_wordcount ?? '?'} words, {section_status}
        </span>
      )}
      {type === ScheduleEventType.PODFIC && (
        <span>
          {wordcount},&nbsp;{status}
        </span>
      )}
    </div>
  );
}
