import useSWR from 'swr';
import { WorkMetadata } from '../forms/podfic/metadataHelpers';
import { getDefaultLength, SectionType } from '../types';
import { getLengthValue } from './lengthHelpers';
export const fetcher = (url) => fetch(url).then((res) => res.json());

export const useChaptersForPodfic = (podficId) => {
  const { data, error, isLoading } = useSWR(
    `/db/chapters/${podficId}`,
    fetcher,
  );

  return {
    chapters: (data ?? []) as Chapter[],
    error,
    isLoading,
  };
};

export const useSectionsForPodfic = (podficId) => {
  const { data, error, isLoading } = useSWR(
    `/db/sections/${podficId}`,
    fetcher,
  );

  return {
    sections: (data ?? []) as Section[],
    error,
    isLoading,
  };
};

export const useDefaultSectionChaptersForPodfic = ({ podficId }) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/db/chapters/${podficId}?section_type=${SectionType.DEFAULT}`,
    fetcher,
  );

  return {
    sections: (data ?? []) as (Section & Chapter)[],
    error,
    isLoading,
    mutate,
  };
};

export const usePodficChaptersWithSubSections = ({ podficId }) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/db/chapters/${podficId}?section_type=${SectionType.CHAPTERS_SPLIT}`,
    fetcher,
  );

  return {
    chapters: (data ?? []) as Chapter[],
    error,
    isLoading,
    mutate,
  };
};

export const useMaxSectionLengthValues = ({ podficId }) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/db/max-section-length/${podficId}`,
    fetcher,
  );

  const lengthData = data ?? { length: null, rawLength: null };
  const length = getLengthValue(lengthData.length);
  const rawLength = getLengthValue(lengthData.rawLength);

  return {
    maxLength: Math.max(length, 1),
    maxRawLength: Math.max(rawLength, 1),
    error,
    isLoading,
    mutate,
  };
};

export const useMaxSectionLength = ({ podficId }) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/db/max-section-length/${podficId}`,
    fetcher,
  );

  return {
    maxSectionLength: (data ?? getDefaultLength()) as Length,
    error,
    isLoading,
    mutate,
  };
};

export const useResourcesOfType = (resourceType = null) => {
  const { data, error, isLoading } = useSWR(
    ['/db/resources', resourceType],
    () => fetcher(`/db/resources?resource_type=${resourceType}`),
  );

  return {
    resources: (data as Resource[]) ?? ([] as Resource[]),
    error,
    isLoading,
  };
};

export const useEventResources = (eventId) => {
  const { data, error, isLoading } = useSWR(['/db/resources', eventId], () =>
    fetcher(`/db/resources?event_id=${eventId}`),
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
    fetcher,
  );

  const podfics = (data ?? []) as (Podfic & Work & Author)[];

  return {
    podfics,
    error,
    isLoading,
  };
};

export const useEvents = ({ childrenFirst = false }) => {
  const { data, error, isLoading } = useSWR(
    `/db/events?children_first=${childrenFirst}`,
    fetcher,
  );

  const events = (data ?? []) as (Event & EventParent)[];

  return {
    events,
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

export const useWorks = () => {
  const { data, error, isLoading } = useSWR('/db/works', fetcher);

  const works = (data ?? []) as Work[];

  return {
    works,
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
  sectionId = null,
  full = false,
) => {
  let response = null;
  if (!!sectionId) {
    response = await fetch(
      `/db/recording_sessions?podfic_id=${podficId}&section_id=${sectionId}`,
    );
  } else if (!!full) {
    response = await fetch(
      `/db/recording_sessions?podfic_id=${podficId}&full=true`,
    );
  } else {
    response = await fetch(`/db/recording_sessions?podfic_id=${podficId}`);
  }

  const data = await response.json();
  return data;
};

const filesFetcher = async (podficId, sectionId, onlyNonAAFiles = false) => {
  let response = null;
  let baseString = `/db/files?podfic_id=${podficId}&section_id=${sectionId}`;
  if (onlyNonAAFiles) {
    baseString = `${baseString}&with_chapters=true&only_non_aa_files=true`;
  } else {
    baseString = `${baseString}&with_chapters=false`;
  }

  response = await fetch(baseString);
  const data = await response.json();
  return data;
};

const resourcesFetcher = async (podficId, chapterId) => {
  let requestString = `/db/resources?`;
  if (podficId) requestString += `podfic_id=${podficId}`;
  else if (chapterId) requestString += `chapter_id=${chapterId}`;

  const response = await fetch(requestString);
  const data = await response.json();
  return data;
};

const podficsFetcher = async (missingAALinks = false) => {
  let response = null;
  if (missingAALinks) {
    response = await fetch(`/db/podfics?missing_aa_links=true`);
  } else {
    response = await fetch('/db/podfics');
  }

  const data = await response.json();
  return data;
};

export const usePodficsFull = ({ missingAALinks = false }) => {
  // don't revalidate if looking at missing aa links podfics, since we want to update w/o them disappearing
  const { data, error, isLoading } = useSWR(
    ['/db/podfics', missingAALinks],
    () => podficsFetcher(missingAALinks),
    {
      revalidateIfStale: !missingAALinks,
      revalidateOnFocus: !missingAALinks,
      revalidateOnReconnect: !missingAALinks,
    },
  );

  const podfics = (data ?? []) as (Podfic & Work & Fandom & Event)[];

  return {
    podfics,
    error,
    isLoading,
  };
};

export const useFiles = ({ podficId, sectionId, onlyNonAAFiles = false }) => {
  const { data, error, isLoading } = useSWR(
    ['/db/files', podficId, sectionId, onlyNonAAFiles],
    () => filesFetcher(podficId, sectionId, onlyNonAAFiles),
  );

  const files = (data ?? []) as File[];

  return {
    files,
    error,
    isLoading,
  };
};

export const useResources = ({ podficId, chapterId }) => {
  const { data, error, isLoading } = useSWR(
    ['/db/resources', podficId, chapterId],
    () => resourcesFetcher(podficId, chapterId),
  );

  const resources = (data ?? []) as Resource[];

  return {
    resources,
    error,
    isLoading,
  };
};

export const useBingoCards = ({ active = true }) => {
  const { data, error, mutate, isLoading } = useSWR(
    `/db/bingos?active=${active}`,
    fetcher,
  );

  const bingoCards = (data ?? []) as BingoCard[];

  return {
    bingoCards,
    error,
    mutate,
    isLoading,
  };
};

export const useScheduleEvents = ({
  minDate,
  maxDate,
}: {
  minDate?: string;
  maxDate?: string;
}) => {
  const { data, error, isLoading } = useSWR(
    `/db/schedule_events?min_date=${minDate || ''}&max_date=${maxDate || ''}`,
    fetcher,
  );

  const scheduleEvents = data ?? [];

  return {
    scheduleEvents,
    error,
    isLoading,
  };
};

export const useRecordingSessions = ({ podficId, sectionId, full }) => {
  const { data, error, isLoading } = useSWR(
    ['/db/recording_sessions', podficId, sectionId, full],
    () => recordingSessionFetcher(podficId, sectionId, full),
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

export const useSectionForPart = (partId: number) => {
  const { data, error, isLoading } = useSWR(
    `/db/sections?part_id=${partId}`,
    fetcher,
  );

  const section = (data ?? {}) as Section;

  return {
    section,
    error,
    isLoading,
  };
};

export const usePodficCountByYear = () => {
  const { data, error, isLoading } = useSWR(
    `/db/stats/podfic_count_by_year`,
    fetcher,
  );

  const podficCountByYear = (data ?? {}) as Record<string, number>;

  return {
    podficCountByYear,
    error,
    isLoading,
  };
};

export const useTags = () => {
  const { data, error, isLoading } = useSWR('/db/tags', fetcher);

  const tags = ((data ?? []) as Tag[]).sort((a, b) =>
    a.tag.localeCompare(b.tag),
  );

  return {
    tags,
    error,
    isLoading,
  };
};

export const useToPodficPodfics = () => {
  const { data, error, isLoading } = useSWR('/db/topodfic', fetcher);

  const podfics = (data ?? []) as (Podfic & Work & Fandom & Event)[];

  return {
    podfics,
    error,
    isLoading,
  };
};

export const useWorkMetadata = ({ workUrl }: { workUrl: string }) => {
  const { data, error, isLoading } = useSWR(
    `/db/metadata/work?work_url=${encodeURIComponent(workUrl)}`,
    fetcher,
  );

  const metadata = (data ?? {}) as WorkMetadata;

  return {
    metadata,
    error,
    isLoading,
  };
};

export interface TagMappings {
  fandom_mapping: Record<string, string>;
  relationship_mapping: Record<string, string>;
  character_mapping: Record<string, string>;
}

export const useTagMappings = () => {
  const { data, error, isLoading } = useSWR(
    '/db/metadata/tagmappings',
    fetcher,
  );

  const tagMappings = (data ?? {}) as TagMappings;

  return {
    tagMappings,
    error,
    isLoading,
  };
};

export const useFandoms = () => {
  const { data, error, isLoading } = useSWR('/db/fandoms', fetcher);

  const fandoms = (data ?? []) as (Fandom & FandomCategory)[];

  return {
    fandoms,
    error,
    isLoading,
  };
};

export const useFandomCategories = () => {
  const { data, error, isLoading } = useSWR('/db/fandoms/categories', fetcher);

  const categories = (data ?? []) as FandomCategory[];

  return {
    categories,
    error,
    isLoading,
  };
};
