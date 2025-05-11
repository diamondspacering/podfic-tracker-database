'use client';

import { Calendar, luxonLocalizer, View, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './schedule.css';
import { DateTime, Settings } from 'luxon';
import { useScheduleEvents } from '@/app/lib/swrLoaders';
import { useCallback, useEffect, useMemo, useState } from 'react';
import EventContent from '@/app/lib/EventContent';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { Button, Typography } from '@mui/material';
import { ScheduledEventType } from '@/app/types';

const timezone = DateTime.local().zoneName;

export default function SchedulePage() {
  // TODO: use min/max/hide completed parameters
  const { scheduleEvents, isLoading: scheduleEventsLoading } =
    useScheduleEvents({});

  const [localEvents, setLocalEvents] = useState([]);

  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());

  useEffect(() => console.log({ scheduleEvents }), [scheduleEvents]);

  useEffect(() => {
    if (!scheduleEventsLoading && !localEvents.length) {
      setLocalEvents(
        scheduleEvents?.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          title: <EventContent scheduleEvent={event} />,
        }))
      );
    }
  }, [localEvents.length, scheduleEvents, scheduleEventsLoading]);

  const { getNow, localizer, scrollToTime } = useMemo(() => {
    Settings.defaultZone = timezone;
    return {
      defaultDate: new Date(),
      getNow: () => DateTime.local().toJSDate(),
      localizer: luxonLocalizer(DateTime),
      myEvents: [...localEvents],
      scrollToTime: DateTime.local().toJSDate(),
    };
  }, [localEvents]);

  const eventPropGetter = useCallback((event) => {
    const seType = event.type;
    switch (seType) {
      case ScheduledEventType.ROUND:
        return { style: { backgroundColor: 'purple' } };
      case ScheduledEventType.PART:
        return { style: { backgroundColor: 'blue' } };
      case ScheduledEventType.CHAPTER:
        return { style: { backgroundColor: 'green' } };
      case ScheduledEventType.PODFIC:
        return { style: { backgroundColor: 'orange' } };
      default:
        return { style: { backgroundColor: 'red' } };
    }
  }, []);

  const DnDCalendar = withDragAndDrop(Calendar);

  return (
    <div>
      <Typography variant='h3'>Schedule</Typography>
      <Button onClick={() => console.log(localEvents)}>Log local events</Button>
      {!scheduleEventsLoading && localEvents.length && (
        <DnDCalendar
          view={view}
          date={date}
          onView={(view) => setView(view)}
          onNavigate={(date) => setDate(new Date(date))}
          localizer={localizer}
          events={localEvents}
          getNow={getNow}
          scrollToTime={scrollToTime}
          style={{ height: '90vh' }}
          // draggableAccessor={() => true}
          // dragFromOutsideItem={dragFromOutsideItem}
          // onDropFromOutside={onDropFromOutside}
          // onEventDrop={moveEvent}
          onDoubleClickEvent={(event) => {
            console.log('double click event', event);
            // TODO: switch statement for appropriate action based on event type
          }}
          selectable
          eventPropGetter={eventPropGetter}
        />
      )}
    </div>
  );
}
