'use client';

import { Button, Typography } from '@mui/material';
import { Calendar, luxonLocalizer, View, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { DateTime, Settings } from 'luxon';
import { useCallback, useEffect, useMemo, useState } from 'react';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './schedule.css';
import styles from './schedule.module.css';
import { useEventPodfics, useScheduledEvents } from '@/app/lib/swrLoaders';
import EventContent from '@/app/lib/EventContent';
import { createUpdateScheduleEvent } from '@/app/lib/updaters';
import { usePathname, useRouter } from 'next/navigation';

const timezone = DateTime.local().zoneName;
const defaultDateStr = '2024-12-01';

function getDate(str, DateTimeObj) {
  return DateTimeObj.fromISO(str).toJSDate();
}

export default function SchedulePage() {
  // TODO: make this not hardcoded for scheduling for one event, make it more general. also fix event sizing better
  const { podfics, isLoading } = useEventPodfics(2);
  const { scheduledEvents, isLoading: scheduledEventsLoading } =
    useScheduledEvents();
  const router = useRouter();
  const pathname = usePathname();

  const [localEvents, setLocalEvents] = useState([]);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState<Date>(new Date());

  const handleDragStart = useCallback((event) => setDraggedEvent(event), []);

  const dragFromOutsideItem = useCallback(
    () => (draggedEvent === 'undroppable' ? null : draggedEvent),
    [draggedEvent]
  );

  useEffect(() => {
    if (!scheduledEventsLoading && !localEvents.length && !isLoading)
      setLocalEvents(
        scheduledEvents?.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          podfic: podfics.find(
            (podfic) => podfic.podfic_id === event.podfic_id
          ),
          title: (
            <EventContent
              podfic={podfics.find(
                (podfic) => podfic.podfic_id === event.podfic_id
              )}
            />
          ),
        }))
      );
  }, [
    scheduledEvents,
    scheduledEventsLoading,
    localEvents,
    podfics,
    isLoading,
  ]);

  const eventPropGetter = useCallback(
    () => ({ style: { height: '150px' } }),
    []
  );

  const moveEvent = useCallback(({ event, start, end, isAllDay }) => {
    setLocalEvents((prev) => {
      const existing =
        prev.find((ev) => ev.podfic_id === event.podfic_id) ?? {};
      const filtered = prev.filter((ev) => ev.podfic_id !== event.podfic_id);
      createUpdateScheduleEvent({
        ...existing,
        title: '',
        start,
        end,
        allday: isAllDay ?? true,
      });
      return [...filtered, { ...existing, start, end, allDay: isAllDay }];
    });
  }, []);

  const onDropFromOutside = useCallback(
    async ({ start, end }) => {
      if (draggedEvent === 'undroppable') {
        setDraggedEvent(null);
        return;
      }

      const event = {
        title: draggedEvent.title,
        podfic_id: draggedEvent.podfic_id,
        start,
        end,
        allDay: true,
      };
      setDraggedEvent(null);
      const id = await createUpdateScheduleEvent({
        ...event,
        title: '',
        allday: true,
      });
      setLocalEvents((prev) => [...prev, { ...event, schedule_event_id: id }]);
    },
    [draggedEvent]
  );

  const { getNow, localizer, scrollToTime } = useMemo(() => {
    Settings.defaultZone = timezone;
    return {
      defaultDate: getDate(defaultDateStr, DateTime),
      getNow: () => DateTime.local().toJSDate(),
      localizer: luxonLocalizer(DateTime),
      myEvents: [...localEvents],
      scrollToTime: DateTime.local().toJSDate(),
    };
  }, [localEvents]);

  const DnDCalendar = withDragAndDrop(Calendar);

  return (
    <div>
      <Typography variant='h3'>Schedule</Typography>
      {/* TODO: colors based on...something? */}
      <Button onClick={() => console.log(localEvents)} variant='contained'>
        log local events
      </Button>
      <div className={styles.flexBox}>
        {podfics
          .filter(
            (podfic) =>
              !localEvents.find(
                (event) => event.podfic_id === podfic.podfic_id
              ) &&
              (podfic.permission_status as unknown as string) !== 'asked' &&
              (podfic.permission_status as unknown as string) !== 'to ask'
          )
          .map((podfic) => (
            <div
              key={podfic.podfic_id}
              className='rbc-event'
              draggable='true'
              style={{
                width: 'fit-content',
              }}
              onDragStart={() =>
                handleDragStart({
                  title: <EventContent podfic={podfic} />,
                  podfic_id: podfic.podfic_id,
                  podfic: podfic,
                })
              }
            >
              <EventContent podfic={podfic} />
            </div>
          ))}
      </div>
      {!scheduledEventsLoading && localEvents.length && (
        <DnDCalendar
          view={view}
          date={date}
          onView={(view) => setView(view)}
          onNavigate={(date) => {
            setDate(new Date(date));
          }}
          dragFromOutsideItem={dragFromOutsideItem}
          localizer={localizer}
          events={localEvents}
          getNow={getNow}
          scrollToTime={scrollToTime}
          style={{ height: '90vh' }}
          draggableAccessor={() => true}
          onDropFromOutside={onDropFromOutside}
          onEventDrop={moveEvent}
          onDoubleClickEvent={(event) => {
            router.push(
              `/dashboard/html?podfic_id=${
                (event as any).podfic_id
              }&return_url=${pathname}`
            );
          }}
          selectable
          eventPropGetter={eventPropGetter}
        />
      )}
    </div>
  );
}
