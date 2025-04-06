import useSWR from 'swr';
export const fetcher = (url) => fetch(url).then((res) => res.json());

export const useChaptersForPodfic = (podficId) => {
  const { data, error, isLoading } = useSWR(
    `/db/chapters/${podficId}`,
    fetcher
  );

  return {
    chapters: data ?? [],
    error,
    isLoading,
  };
};

export const useResources = (resourceType = null) => {
  const { data, error, isLoading } = useSWR(
    ['/db/resources', resourceType],
    () => fetcher(`/db/resources?resource_type=${resourceType}`)
  );

  return {
    resources: (data as Resource[]) ?? ([] as Resource[]),
    error,
    isLoading,
  };
};

export const useEventPodfics = (eventId) => {
  const { data, error, isLoading } = useSWR(
    `/db/podfics?event_id=${eventId}`,
    fetcher
  );

  const podfics = (data ?? []) as (Podfic & Work & Author)[];

  return {
    podfics,
    error,
    isLoading,
  };
};

export const useAuthors = () => {
  const { data, error, isLoading } = useSWR('/db/authors', fetcher);

  const authors = (data ?? []) as Author[];

  return {
    authors,
    error,
    isLoading,
  };
};

export const usePodficcers = () => {
  const { data, error, isLoading } = useSWR('/db/podficcers', fetcher);

  const podficcers = (data ?? []) as Podficcer[];

  return {
    podficcers,
    error,
    isLoading,
  };
};

export const usePodficcer = (id) => {
  const { data, error, isLoading } = useSWR(`/db/podficcers/${id}`, fetcher);

  const podficcer = (data ?? {}) as Podficcer;

  return {
    podficcer,
    error,
    isLoading,
  };
};

export const useVoiceteamEvent = (id) => {
  const { data, error, isLoading } = useSWR(`/db/voiceteam/${id}`, fetcher);

  const voiceteamEvent = (data ?? {}) as VoiceteamEvent;

  return {
    voiceteamEvent,
    error,
    isLoading,
  };
};

const recordingSessionFetcher = async (
  podficId,
  chapterId = null,
  full = false
) => {
  let response = null;
  if (!!chapterId) {
    response = await fetch(
      `/db/recording_sessions?podfic_id=${podficId}&chapter_id=${chapterId}`
    );
  } else if (!!full) {
    response = await fetch(
      `/db/recording_sessions?podfic_id=${podficId}&full=true`
    );
  } else {
    response = await fetch(`/db/recording_sessions?podfic_id=${podficId}`);
  }

  const data = await response.json();
  return data;
};

export const usePodficsFull = () => {
  const { data, error, isLoading } = useSWR('/db/podfics', fetcher);

  const podfics = (data ?? []) as (Podfic & Work & Fandom & Event)[];

  return {
    podfics,
    error,
    isLoading,
  };
};

export const useScheduledEvents = () => {
  const { data, error, isLoading } = useSWR('/db/schedule_events', fetcher);

  const scheduledEvents = data ?? [];

  return {
    scheduledEvents,
    error,
    isLoading,
  };
};

export const useRecordingSessions = ({ podficId, chapterId, full }) => {
  const { data, error, isLoading } = useSWR(
    ['/db/recording_sessions', podficId, chapterId, full],
    () => recordingSessionFetcher(podficId, chapterId, full)
  );

  const recordingSessions = (data ?? []) as RecordingSession[];

  return {
    recordingSessions,
    error,
    isLoading,
  };
};

export const useParts = () => {
  const { data, error, isLoading } = useSWR('/db/parts', fetcher);

  const parts = (data ?? []) as PartWithContext[];

  return {
    parts,
    error,
    isLoading,
  };
};

export const usePart = (id: number) => {
  const { data, error, isLoading } = useSWR(`/db/parts/${id}`, fetcher);

  const part = (data ?? {}) as Part & Podficcer;

  return {
    part,
    error,
    isLoading,
  };
};
