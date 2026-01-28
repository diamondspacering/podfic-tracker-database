import { DateTime } from 'luxon';
import { ScheduleEventType } from '../types';

// }
interface EventContentProps {
  scheduleEvent: ScheduleEvent;
}

export default function EventContent({ scheduleEvent }: EventContentProps) {
  const {
    end,
    type,
    title,
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

  console.log('end', end);
  return (
    <div
      style={{
        maxWidth: '350px',
        textWrap: 'wrap',
      }}
    >
      {title && (
        <>
          <span>{title}</span>
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
          {`, ${section_wordcount}, ${section_status}`}
        </span>
      )}
      {type === ScheduleEventType.PART && (
        <span>
          {part},&nbsp;{section_wordcount} words
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
