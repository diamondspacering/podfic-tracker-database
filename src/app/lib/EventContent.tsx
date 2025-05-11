// interface EventContentProps {
//   podfic?: Podfic & Work;
//   chapter?: Chapter;
//   part?: Part;
//   round?: Round;

import { DateTime } from 'luxon';
import { ScheduledEventType } from '../types';

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
    chapter_title,
    chapter_number,
    chapter_wordcount,
    chapter_status,
    part,
    part_wordcount,
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
      {round_number && (
        <>
          <span>
            Voiceteam Round {round_number} ends,{' '}
            {DateTime.fromISO(end as string).toLocaleString(
              DateTime.TIME_SIMPLE
            )}
          </span>
          <br />
        </>
      )}
      {chapter_number && (
        <span>
          {chapter_number}
          {chapter_title ? ` - ${chapter_title}` : ''}
          {`, ${chapter_wordcount}, ${chapter_status}`}
        </span>
      )}
      {part && (
        <span>
          {part},&nbsp;{part_wordcount} words
        </span>
      )}
      {type === ScheduledEventType.PODFIC && (
        <span>
          {wordcount},&nbsp;{status}
        </span>
      )}
    </div>
  );
}
