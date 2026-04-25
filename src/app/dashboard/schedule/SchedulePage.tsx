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
import { ScheduleEventType } from '@/app/types';
import { useRouter } from 'next/navigation';
import { Add } from '@mui/icons-material';
import ScheduleEventDialog from '@/app/ui/schedule-event/schedule-event-dialog';

const timezone = DateTime.local().zoneName;

/* TODO:
  - set up automatic triggers to create schedule events for deadlines (partially implemented)
    - make sure you know how date is being sent
  - make query that automatically pulls in info for the podfic/chapter/part/round that it's linked to so the info is already there and you don't have to find it or whatever
  - relevant link to thing based on its properties
  - limit query based on selected date
  - better date selection
  - add changing deadlines on things by dragging?
*/
export default function SchedulePage() {
  const { scheduleEvents, isLoading: scheduleEventsLoading } =
    useScheduleEvents({});

  const [localEvents, setLocalEvents] = useState([]);

  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date('2025-05-03'));

  const [scheduleEventDialogOpen, setScheduleEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    ScheduleEvent | undefined
  >();

  const router = useRouter();

  // useEffect(() => console.log({ scheduleEvents }), [scheduleEvents]);

  useEffect(() => {
    if (!scheduleEventsLoading && !localEvents.length) {
      setLocalEvents(
        scheduleEvents?.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          title: <EventContent scheduleEvent={event} />,
        })),
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
      case ScheduleEventType.ROUND:
        return { style: { backgroundColor: 'purple' } };
      case ScheduleEventType.PART:
        return { style: { backgroundColor: 'blue' } };
      case ScheduleEventType.SECTION:
        return { style: { backgroundColor: 'green' } };
      case ScheduleEventType.PODFIC:
        return { style: { backgroundColor: 'orange' } };
      default:
        return { style: { backgroundColor: 'red' } };
    }
  }, []);

  const eventOnClick = useCallback(
    (event) => {
      const seType = event.type;
      console.log({ event });
      switch (seType) {
        case ScheduleEventType.ROUND:
          router.push(
            `/dashboard/voiceteam/${event.event_id}?round=${event.round_number}`,
          );
        case ScheduleEventType.PART:
          router.push(`/dashboard/parts`);
        case ScheduleEventType.SECTION:
          return;
        case ScheduleEventType.PODFIC:
          router.push(`/forms/podfic/${event.podfic_id}`);
      }
    },
    [router],
  );

  const DnDCalendar = withDragAndDrop(Calendar);

  return (
    <div>
      <Typography variant='h3'>Schedule</Typography>
      <Button onClick={() => console.log(localEvents)}>Log local events</Button>
      {/* TODO: that's unclear wording try fixing that */}
      <Button
        variant='contained'
        startIcon={<Add />}
        onClick={() => setScheduleEventDialogOpen(true)}
      >
        New Schedule Event
      </Button>
      {scheduleEventDialogOpen && (
        <ScheduleEventDialog
          item={selectedEvent}
          isOpen={scheduleEventDialogOpen}
          onClose={() => setScheduleEventDialogOpen(false)}
        />
      )}
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
          onDoubleClickEvent={eventOnClick}
          // onSelectEvent={eventOnClick}
          selectable
          eventPropGetter={eventPropGetter}
          onSelectSlot={(slotInfo) => console.log({ slotInfo })}
        />
      )}
    </div>
  );
}
