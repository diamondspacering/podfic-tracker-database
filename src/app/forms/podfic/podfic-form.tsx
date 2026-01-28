'use client';

import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import styles from '@/app/forms/forms.module.css';
import { Add, Close } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FandomForm from './fandom-form';
import AuthorForm from './author-form-inline';
import {
  Category,
  PodficStatus,
  PodficType,
  Rating,
  SectionType,
} from '@/app/types';
import { formatDateString, formatDateTimeString } from '@/app/lib/format';
import StatusSelect from '@/app/ui/StatusSelect';
import DatePicker from '@/app/ui/DatePicker';
import SeriesForm from './series-form';
import { TagMappings, usePodficcers } from '@/app/lib/swrLoaders';
import PodficcerDialog from '@/app/ui/podficcer/podficcer-dialog';
import TagSelect from '@/app/ui/TagSelect';
import { LoadingButton } from '@mui/lab';
import MetadataDialog from './metadata-dialog';
import { WorkMetadata } from './metadataHelpers';
import ChapterForm from './chapter-form';
import DetailsWrapper from '@/app/ui/DetailsWrapper';
import SectionForm from './SectionForm';

interface PodficFormProps {
  podfic: Podfic & Work;
  setPodfic: React.Dispatch<React.SetStateAction<Podfic & Work>>;
  excludeChapters?: boolean;
}

export default function PodficForm({
  podfic,
  setPodfic,
  excludeChapters = false,
}: PodficFormProps) {
  const [isNewWork, setIsNewWork] = useState(true);
  const [metadata, setMetadata] = useState<WorkMetadata>({});
  const [tagMappings, setTagMappings] = useState<TagMappings | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [works, setWorks] = useState<(Work & Fandom)[]>([]);
  const [worksLoading, setWorksLoading] = useState(false);

  const [fandoms, setFandoms] = useState<(Fandom & FandomCategory)[]>([]);
  const [fandomsLoading, setFandomsLoading] = useState(true);
  const [isNewFandom, setIsNewFandom] = useState(false);

  const [events, setEvents] = useState<(Event & EventParent)[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [challengeId, setChallengeId] = useState(null);
  const [projects, setProjects] = useState<Project[]>([]);

  const [seriesLoading, setSeriesLoading] = useState(true);
  const [series, setSeries] = useState<Series[]>([]);
  const [isNewSeries, setIsNewSeries] = useState(false);

  const [isMultivoice, setIsMultivoice] = useState(false);
  const [wordcount, setWordcount] = useState('');
  const [isBackDated, setIsBackDated] = useState(false);
  interface SectionInfo {
    [index: number]: Partial<Section>[];
  }
  const [sectionInfo, setSectionInfo] = useState<SectionInfo>({});

  const [podficcerDialogOpen, setPodficcerDialogOpen] = useState(false);
  const [newPodficcerGiftee, setNewPodficcerGiftee] = useState(false);
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [isNewAuthor, setIsNewAuthor] = useState(false);

  const rating = useMemo(() => podfic.rating ?? null, [podfic.rating]);
  const category = useMemo(() => podfic.category ?? null, [podfic.category]);

  const { podficcers, isLoading: podficcersLoading } = usePodficcers();

  // TODO: directly handle sectionInfo more it could be handy
  useEffect(() => {
    setPodfic((prev) => ({
      ...prev,
      sections: Object.values(sectionInfo).flat(),
    }));
  }, [setPodfic, sectionInfo]);

  useEffect(() => {
    if (
      podfic.status === PodficStatus.POSTED &&
      !podfic.posted_date &&
      podfic.posted_date !== ''
    ) {
      setPodfic((prev) => ({
        ...prev,
        posted_date: formatDateString(new Date()),
      }));
    } else if (podfic.posted_date?.includes('Z')) {
      setPodfic((prev) => ({
        ...prev,
        posted_date: formatDateString(new Date(prev.posted_date)),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podfic.status, podfic.posted_date]);

  useEffect(() => {
    if (!podfic.added_date)
      setPodfic((prev) => ({
        ...prev,
        added_date: formatDateTimeString(new Date()),
      }));
    else if (podfic.added_date.includes('Z'))
      setPodfic((prev) => ({
        ...prev,
        added_date: formatDateTimeString(new Date(podfic.added_date)),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podfic.added_date]);

  const fetchMetadata = useCallback(async () => {
    setMetadataLoading(true);
    const metadataResult = await fetch(
      `/db/metadata/work?work_url=${encodeURIComponent(podfic.link)}`,
    );
    setMetadata(await metadataResult.json());
    const tagResult = await fetch('/db/metadata/tagmappings');
    setTagMappings(await tagResult.json());
    setMetadataLoading(false);
  }, [podfic.link]);

  const fetchAuthors = useCallback(async () => {
    setAuthorsLoading(true);
    const result = await fetch('/db/authors');
    const data = await result.json();
    setAuthors(data as Author[]);
    setAuthorsLoading(false);
  }, []);

  const fetchEvents = useCallback(async () => {
    setEventsLoading(true);
    const result = await fetch('/db/events?children_first=true');
    const data = await result.json();
    setEvents(data as (Event & EventParent)[]);
    setEventsLoading(false);
  }, []);

  const fetchFandoms = useCallback(async () => {
    setFandomsLoading(true);
    const result = await fetch('/db/fandoms');
    const data = await result.json();
    setFandoms(data as (Fandom & FandomCategory)[]);
    setFandomsLoading(false);
  }, []);

  const fetchWorks = useCallback(async () => {
    setWorksLoading(true);
    const result = await fetch('/db/works');
    const data = await result.json();
    setWorks(data as (Work & Fandom)[]);
    setWorksLoading(false);
  }, []);

  const fetchSeries = useCallback(async () => {
    setSeriesLoading(true);
    const result = await fetch('/db/series');
    const data = await result.json();
    setSeries(data as Series[]);
    setSeriesLoading(false);
  }, []);

  const fetchChallengesAndProjects = useCallback(async (eventId) => {
    setChallengesLoading(true);
    const result = await fetch(`/db/voiceteam/${eventId}/challenges`);
    const data = await result.json();
    setChallenges(data as Challenge[]);
    setProjects(data.flatMap((challenge) => challenge.projects));
    setChallengesLoading(false);
  }, []);

  useEffect(() => {
    fetchAuthors();
    fetchEvents();
    fetchFandoms();
    fetchSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isNewWork) fetchWorks();
  }, [isNewWork, fetchWorks]);

  // NOTE: This seems to be necessary because of MUI components not handling controlled state very well
  useEffect(() => {
    setPodfic((prev) => ({
      ...prev,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setIsMultivoice(podfic.is_multivoice);
  }, [podfic.is_multivoice]);

  useEffect(() => {
    setWordcount(podfic.wordcount?.toString());
  }, [podfic.wordcount]);

  const isVoiceteam = useMemo(
    () =>
      podfic.event_id &&
      events
        ?.find((event) => event.event_id === podfic.event_id)
        ?.parent_name?.includes('Voiceteam'),
    [podfic.event_id, events],
  );

  useEffect(() => {
    if (isVoiceteam) fetchChallengesAndProjects(podfic.event_id);
  }, [isVoiceteam, podfic.event_id, fetchChallengesAndProjects]);

  useEffect(() => {
    if (isVoiceteam && podfic.vt_project_id && !challengesLoading) {
      const id = projects.find(
        (project) => project.vt_project_id === podfic.vt_project_id,
      )?.challenge_id;
      setChallengeId(id ?? null);
    }
  }, [isVoiceteam, podfic.vt_project_id, challengesLoading, projects]);

  return (
    <div className={styles.fullWidth}>
      <PodficcerDialog
        isOpen={podficcerDialogOpen}
        onClose={() => setPodficcerDialogOpen(false)}
        submitCallback={(podficcer) => {
          if (newPodficcerGiftee) {
            setPodfic((prev) => ({
              ...prev,
              giftee_id: podficcer.podficcer_id,
            }));
          } else {
            setPodfic((prev) => ({
              ...prev,
              podficcers: [...(prev.podficcers ?? []), podficcer],
            }));
          }

          setPodficcerDialogOpen(false);
        }}
      />
      {metadataDialogOpen && (
        <MetadataDialog
          isOpen={metadataDialogOpen}
          onClose={() => setMetadataDialogOpen(false)}
          metadata={metadata}
          tagMappings={tagMappings}
          submitCallback={async (metadata) => {
            if (metadata.fandom_id) {
              const foundFandom = fandoms.find(
                (fandom) => fandom.fandom_id === metadata.fandom_id,
              );
              if (!foundFandom) await fetchFandoms();
            }
            if (metadata.author_id) {
              const foundAuthor = authors.find(
                (author) => author.author_id === metadata.author_id,
              );
              if (!foundAuthor) await fetchAuthors();
            }
            console.log({ metadata });
            setPodfic((prev) => ({
              ...prev,
              title: metadata.title ?? prev.title,
              author_id: metadata.author_id ?? prev.author_id,
              fandom_id: metadata.fandom_id ?? prev.fandom_id,
              rating: metadata.rating ?? prev.rating,
              category: metadata.category ?? prev.category,
              relationship: metadata.relationship ?? prev.relationship,
              main_character: metadata.main_character ?? prev.main_character,
              wordcount: metadata.wordcount ?? prev.wordcount,
              chapter_count: metadata.chapter_count ?? prev.chapter_count,
              chaptered: metadata.chaptered ?? prev.chaptered,
              chapters: metadata.chapters,
            }));
            setMetadataDialogOpen(false);
          }}
          workUrl={podfic.link ?? ''}
        />
      )}
      <Button variant='contained' onClick={() => console.log({ podfic })}>
        Log podfic
      </Button>
      <Button variant='contained' onClick={() => console.log({ events })}>
        Log events
      </Button>
      <Button variant='contained' onClick={() => console.log({ challenges })}>
        Log challenges
      </Button>
      <Button variant='contained' onClick={() => console.log({ sectionInfo })}>
        Log section info
      </Button>

      <br />
      <br />

      {/* Work Info */}
      <DetailsWrapper
        className={styles.fullWidth}
        header={<Typography variant='h6'>Work</Typography>}
      >
        <FormControlLabel
          label='Existing work'
          control={
            <Checkbox
              checked={!isNewWork}
              onChange={(e) => setIsNewWork(!e.target.checked)}
            />
          }
        />
        {!isNewWork && (
          <>
            <Autocomplete
              size='small'
              loading={worksLoading}
              options={works}
              value={
                works?.find((work) => work.work_id === podfic.work_id) ?? {
                  work_id: '',
                  title: '',
                  fandom_name: '',
                }
              }
              sx={{
                width: '300px',
              }}
              getOptionLabel={(option) => option?.title ?? '(unknown)'}
              groupBy={(option) => option?.fandom_name ?? '(unknown fandom)'}
              onChange={(_, newValue) => {
                // it doesn't work for removing stuff very well but it's fiine
                // needs to have a null fallback
                setPodfic(
                  (prev) =>
                    ({
                      ...prev,
                      ...newValue,
                      // work_id:
                      //   typeof newValue.work_id === 'number'
                      //     ? newValue.work_id
                      //     : parseInt(newValue.work_id),
                      // title: newValue.title,
                      // fandom_id: newValue.fandom_id,
                    }) as any,
                );
              }}
              renderInput={(params) => (
                <TextField {...params} label='Work&nbsp;&nbsp;&nbsp;' />
              )}
            />
            <br />
          </>
        )}
        <div className={styles.flexRow}>
          <TextField
            label='AO3 Link'
            size='small'
            value={podfic.link ?? ''}
            onChange={(e) =>
              setPodfic((prev) => ({ ...prev, link: e.target.value }))
            }
          />
          <LoadingButton
            variant='contained'
            loading={metadataLoading}
            onClick={async () => {
              await fetchMetadata();
              setMetadataDialogOpen(true);
            }}
          >
            Fetch AO3 metadata
          </LoadingButton>
          <FormControlLabel
            label='Pull metadata from AO3 later'
            control={
              <Checkbox
                checked={podfic.needs_update ?? false}
                onChange={(e) =>
                  setPodfic((prev) => ({
                    ...prev,
                    needs_update: e.target.checked,
                  }))
                }
              />
            }
          />
        </div>
      </DetailsWrapper>

      <br />

      {/* Work Metadata */}
      <DetailsWrapper header={<Typography variant='h6'>Metadata</Typography>}>
        <>
          <div className={styles.flexRow} style={{ paddingBottom: '2rem' }}>
            <div className={`${styles.flexColumn} ${styles.fitContent}`}>
              <TextField
                label='Title'
                size='small'
                sx={{
                  width: '700px',
                }}
                value={podfic.title ?? ''}
                onChange={(e) =>
                  setPodfic((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <TextField
                label='Nickname'
                size='small'
                sx={{
                  width: '500px',
                }}
                value={podfic.nickname ?? ''}
                onChange={(e) =>
                  setPodfic((prev) => ({ ...prev, nickname: e.target.value }))
                }
              />
            </div>
            {/* author */}
            <div className={`${styles.flexColumn} ${styles.fitContent}`}>
              <Autocomplete
                size='small'
                loading={authorsLoading}
                options={authors}
                isOptionEqualToValue={(option, value) => {
                  return option.author_id === value.author_id;
                }}
                value={
                  authors.find(
                    (author) => author.author_id === podfic.author_id,
                  ) ?? { author_id: 0, username: '' }
                }
                sx={{
                  width: '300px',
                }}
                getOptionLabel={(option) => option?.username ?? '(unknown)'}
                onChange={(_, newValue) => {
                  setPodfic((prev) => ({
                    ...prev,
                    author_id: newValue?.author_id ?? null,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size='small'
                    label='Author&nbsp;&nbsp;&nbsp;'
                  />
                )}
              />
              {/* TODO: new author method of metadata that puts more stuff in */}
              {isNewAuthor ? (
                <AuthorForm
                  updateCallback={async (val) => {
                    await fetchAuthors();
                    setPodfic((prev) => ({ ...prev, author_id: val }));
                    setIsNewAuthor(false);
                  }}
                />
              ) : (
                <Button
                  onClick={() => setIsNewAuthor(true)}
                  startIcon={<Add />}
                >
                  New Author
                </Button>
              )}
            </div>
            {/* fandoms */}
            <div className={styles.flexColumn}>
              <Autocomplete
                size='small'
                loading={fandomsLoading}
                options={fandoms}
                value={
                  fandoms?.find(
                    (fandom) => fandom.fandom_id === podfic.fandom_id,
                  ) ?? { fandom_name: '', fandom_id: 0, category_name: '' }
                }
                sx={{
                  width: '300px',
                }}
                getOptionLabel={(option) => option?.fandom_name ?? '(unknown)'}
                groupBy={(option) => option?.category_name ?? '(unknown)'}
                onChange={(_, newValue) => {
                  setPodfic((prev) => ({
                    ...prev,
                    fandom_id: newValue?.fandom_id ?? null,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size='small'
                    label='Fandom&nbsp;&nbsp;&nbsp;'
                  />
                )}
              />
              {isNewFandom ? (
                <FandomForm
                  updateCallback={async (value) => {
                    await fetchFandoms();
                    setPodfic((prev) => ({ ...prev, fandom_id: value }));
                    setIsNewFandom(false);
                  }}
                />
              ) : (
                <Button
                  onClick={() => setIsNewFandom(true)}
                  startIcon={<Add />}
                >
                  New Fandom
                </Button>
              )}
            </div>
          </div>
          <div className={styles.flexColumn}>
            <TextField
              size='small'
              label='Wordcount'
              value={wordcount}
              onChange={(e) => {
                setWordcount(e.target.value);
                setPodfic((prev) => ({
                  ...prev,
                  wordcount: parseInt(e.target.value),
                }));
              }}
            />
            {/* TODO: these do not visibly autofill for some reason. figure that out. */}
            <div className={styles.flexRow}>
              <TextField
                size='small'
                sx={{
                  width: '120px',
                }}
                select
                label='Rating'
                value={rating}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onChange={(e) => {
                  setPodfic((prev) => ({
                    ...prev,
                    rating: e.target.value as Rating,
                  }));
                }}
              >
                {Object.values(Rating).map((rating) => (
                  <MenuItem key={rating} value={rating}>
                    <span>{rating}</span>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size='small'
                sx={{
                  width: '120px',
                }}
                select
                label='Category'
                value={category}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onChange={(e) =>
                  setPodfic((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                {Object.values(Category).map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </div>
        </>
      </DetailsWrapper>
      {/* end metadata */}
      <br />
      <br />

      <DetailsWrapper header={<Typography variant='h6'>Chapters</Typography>}>
        <>
          <div className={styles.flexRow}>
            <FormControlLabel
              label='Chaptered'
              control={
                <Checkbox
                  checked={podfic.chaptered ?? false}
                  value={podfic.chaptered ?? false}
                  onChange={(e) =>
                    setPodfic((prev) => ({
                      ...prev,
                      chaptered: e.target.checked,
                    }))
                  }
                />
              }
            />
          </div>
          {podfic.chaptered && !excludeChapters && (
            <TextField
              size='small'
              sx={{
                width: '100px',
              }}
              label='Chapter Count'
              value={
                podfic.chapter_count ? podfic.chapter_count.toString() : ''
              }
              onChange={(e) =>
                setPodfic((prev) => ({
                  ...prev,
                  chapter_count: parseInt(e.target.value),
                }))
              }
            />
          )}
          {!excludeChapters &&
            podfic.chapters?.map((chapter, index) => (
              <ChapterForm
                key={index}
                chapter={chapter}
                setChapter={
                  !podfic.podfic_id
                    ? (value) =>
                        setPodfic((prev) => ({
                          ...prev,
                          chapters: prev.chapters.map((chapter, ci) =>
                            index === ci ? value : chapter,
                          ),
                        }))
                    : null
                }
              />
            ))}
          {podfic.chaptered && !excludeChapters && (
            <Button
              variant='contained'
              className={styles.mlAuto}
              onClick={() => {
                let chapterCount = podfic.chapter_count;
                if (!chapterCount) {
                  chapterCount = 1;
                } else if (chapterCount === podfic.chapters?.length) {
                  chapterCount += 1;
                }
                setPodfic((prev) => ({
                  ...prev,
                  chapters: [
                    ...(prev.chapters ?? []),
                    {
                      podfic_id: podfic.podfic_id,
                      chapter_number: (prev.chapters?.length ?? 0) + 1,
                    },
                  ],
                  chapter_count: chapterCount,
                }));
              }}
              startIcon={<Add />}
            >
              Add chapter
            </Button>
          )}
        </>
      </DetailsWrapper>
      <br />
      <br />

      {/* Project Info */}
      <DetailsWrapper
        header={<Typography variant='h6'>Project Info</Typography>}
      >
        <>
          <div className={styles.flexColumn}>
            {/* posted info */}

            {/* series */}
            <div className={styles.flexColumn}>
              <Autocomplete
                size='small'
                options={series}
                loading={seriesLoading}
                isOptionEqualToValue={(option, value) =>
                  option.series_id === value.series_id
                }
                value={
                  series.find((s) => s.series_id === podfic.series_id) ?? {
                    series_id: 0,
                    name: '',
                  }
                }
                sx={{
                  width: '300px',
                }}
                getOptionLabel={(option) => option.name}
                onChange={(_, newValue) => {
                  setPodfic((prev) => ({
                    ...prev,
                    series_id: newValue?.series_id ?? null,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size='small'
                    label='Series&nbsp;&nbsp;&nbsp;'
                  />
                )}
              />
              {isNewSeries ? (
                <SeriesForm
                  updateCallback={async (val) => {
                    await fetchSeries();
                    setPodfic((prev) => ({ ...prev, series_id: val }));
                    setIsNewSeries(false);
                  }}
                />
              ) : (
                <Button
                  onClick={() => setIsNewSeries(true)}
                  startIcon={<Add />}
                >
                  New Series
                </Button>
              )}
            </div>
            {/* events & vt info */}
            <div className={styles.flexRow}>
              <Autocomplete
                size='small'
                options={events}
                loading={eventsLoading}
                isOptionEqualToValue={(option, value) =>
                  option.event_id === value.event_id
                }
                value={
                  events?.find((event) => event.event_id === podfic.event_id) ??
                  ({
                    event_id: 0,
                    parent_id: 0,
                    name: '',
                    year: '',
                    parent_name: '',
                  } as Event & EventParent)
                }
                sx={{
                  width: '300px',
                }}
                getOptionLabel={(option: Event & EventParent) =>
                  option?.name ? `${option?.name} ${option?.year}` : ''
                }
                groupBy={(option: Event & EventParent) =>
                  option?.parent_name ?? '(unknown parent)'
                }
                onChange={(_, newValue: Event & EventParent) => {
                  setPodfic((prev) => ({
                    ...prev,
                    event_id: newValue?.event_id ?? null,
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size='small'
                    label='Event&nbsp;&nbsp;&nbsp;'
                  />
                )}
              />
              {isVoiceteam && (
                <>
                  <Autocomplete
                    size='small'
                    sx={{
                      width: '300px',
                    }}
                    options={challenges}
                    loading={challengesLoading}
                    isOptionEqualToValue={(option, value) =>
                      option.challenge_id === value.challenge_id
                    }
                    getOptionLabel={(option) => option.challenge_name}
                    value={
                      challenges?.find(
                        (challenge) => challenge.challenge_id === challengeId,
                      ) ??
                      ({ challenge_id: 0, challenge_name: '' } as Challenge)
                    }
                    onChange={(_, newValue) => {
                      setChallengeId(newValue?.challenge_id ?? null);
                      setPodfic((prev) => ({
                        ...prev,
                        vt_project_id: null,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size='small'
                        label='Challenge&nbsp;&nbsp;&nbsp;'
                      />
                    )}
                  />
                  <Autocomplete
                    options={
                      challengeId
                        ? projects.filter((p) => p.challenge_id === challengeId)
                        : projects
                    }
                    sx={{
                      width: '300px',
                    }}
                    size='small'
                    loading={challengesLoading}
                    isOptionEqualToValue={(option, value) =>
                      option.vt_project_id === value.vt_project_id
                    }
                    getOptionLabel={(option) => option.name}
                    value={
                      projects.find(
                        (project) =>
                          project.vt_project_id === podfic.vt_project_id,
                      ) ?? ({ vt_project_id: 0, name: '' } as Project)
                    }
                    groupBy={(option) => option.challenge_name ?? ''}
                    onChange={(_, newValue) => {
                      setPodfic((prev) => ({
                        ...prev,
                        vt_project_id: newValue?.vt_project_id ?? null,
                      }));
                      setChallengeId(newValue?.challenge_id ?? null);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size='small'
                        label='Project&nbsp;&nbsp;&nbsp;'
                      />
                    )}
                  />
                </>
              )}
            </div>
            <Autocomplete
              size='small'
              sx={{
                minWidth: '200px',
              }}
              options={podficcers ?? []}
              loading={podficcersLoading}
              getOptionLabel={(option) => option?.username ?? ''}
              value={
                podficcers.find((p) => p.podficcer_id === podfic.giftee_id) ??
                null
              }
              isOptionEqualToValue={(option, value) => {
                return option.podficcer_id === value.podficcer_id;
              }}
              onChange={(_, newValue) => {
                setPodfic((prev) => ({
                  ...prev,
                  giftee_id: newValue?.podficcer_id ?? null,
                }));
              }}
              renderInput={(params) => (
                <TextField {...params} size='small' label='Gifted to' />
              )}
            />
            <Button
              onClick={() => {
                setNewPodficcerGiftee(true);
                setPodficcerDialogOpen(true);
              }}
              startIcon={<Add />}
            >
              New Podficcer
            </Button>
            <>
              <TextField
                size='small'
                select
                sx={{
                  width: '200px',
                }}
                label={'Type'}
                value={podfic.type ?? null}
                onChange={(e) =>
                  setPodfic((prev) => ({
                    ...prev,
                    type: e.target.value as PodficType,
                  }))
                }
              >
                {Object.values(PodficType).map((type) => (
                  <MenuItem key={type} value={type}>
                    <span>{type}</span>
                  </MenuItem>
                ))}
              </TextField>
              <div className={styles.flexRow}>
                <FormControlLabel
                  label='Is multivoice?'
                  control={
                    <Checkbox
                      checked={isMultivoice}
                      onChange={(e) => {
                        setIsMultivoice(e.target.checked);
                        setPodfic((prev) => ({
                          ...prev,
                          is_multivoice: e.target.checked,
                        }));
                      }}
                    />
                  }
                />
                {isMultivoice && (
                  <FormControlLabel
                    label='I am posting this'
                    control={
                      <Checkbox
                        checked={podfic.self_posted}
                        onChange={(e) =>
                          setPodfic((prev) => ({
                            ...prev,
                            self_posted: e.target.checked,
                          }))
                        }
                      />
                    }
                  />
                )}
              </div>
            </>

            <TagSelect
              existingTags={podfic.tags ?? []}
              addToExistingTags={(newTag) => {
                console.log({ newTag });
                setPodfic((prev) => ({
                  ...prev,
                  tags: [...(prev.tags ?? []), newTag],
                }));
              }}
              setExistingTags={(tags) => {
                setPodfic((prev) => ({
                  ...prev,
                  tags,
                }));
              }}
              showExistingTags
            />

            <Autocomplete
              size='small'
              sx={{
                minWidth: '200px',
              }}
              options={podficcers ?? []}
              loading={podficcersLoading}
              getOptionLabel={(option) => option?.username ?? ''}
              multiple
              value={podfic.podficcers ?? []}
              onChange={(_, newValue) => {
                setPodfic((prev) => ({
                  ...prev,
                  podficcers: newValue,
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size='small'
                  label='Podficcers&nbsp;&nbsp;'
                />
              )}
            />
            <Button
              onClick={() => {
                setNewPodficcerGiftee(false);
                setPodficcerDialogOpen(true);
              }}
              startIcon={<Add />}
            >
              New Podficcer
            </Button>
          </div>

          <div className={styles.flexRow}>
            <FormControlLabel
              label='Backdate podfic?'
              control={
                <Checkbox
                  checked={isBackDated}
                  onChange={(e) => setIsBackDated(e.target.checked)}
                />
              }
            />
            {isBackDated && (
              <TextField
                size='small'
                label='Added Date'
                type='datetime-local'
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                value={podfic.added_date ?? ''}
                onChange={(e) =>
                  setPodfic((prev) => ({ ...prev, added_date: e.target.value }))
                }
              />
            )}
          </div>
        </>
      </DetailsWrapper>

      <br />
      <br />

      {/* Posting Info */}
      <DetailsWrapper
        header={<Typography variant='h6'>Posting Info</Typography>}
      >
        <div className={styles.flexColumn}>
          <div className={styles.flexRow}>
            <StatusSelect
              value={podfic.status ?? ''}
              setValue={(val) =>
                setPodfic((prev) => ({ ...prev, status: val }))
              }
              type='podfic'
            />
            {podfic.status === PodficStatus.POSTED && (
              <DatePicker
                label='Posted Date'
                value={podfic.posted_date ?? ''}
                onChange={(val) => {
                  setPodfic((prev) => ({ ...prev, posted_date: val }));
                }}
              />
            )}
            {podfic.status === PodficStatus.POSTED && (
              <TextField
                size='small'
                label='Posted Year'
                value={podfic.posted_year?.toString() ?? ''}
                onChange={(e) =>
                  setPodfic((prev) => ({
                    ...prev,
                    posted_year: parseInt(e.target.value),
                  }))
                }
              />
            )}
          </div>
          <TextField
            size='small'
            label='AO3 link'
            value={podfic.ao3_link ?? ''}
            onChange={(e) =>
              setPodfic((prev) => ({ ...prev, ao3_link: e.target.value }))
            }
          />
          <FormControlLabel
            label='Posting in separate sections or not according to chapters?'
            control={
              <Checkbox
                checked={podfic.section_type !== SectionType.DEFAULT}
                onChange={(e) => {
                  if (!e.target.checked)
                    setPodfic((prev) => ({
                      ...prev,
                      section_type: SectionType.DEFAULT,
                    }));
                  else setPodfic((prev) => ({ ...prev, section_type: null }));
                }}
              />
            }
          />
          {podfic.section_type !== SectionType.DEFAULT && (
            <>
              {/* radio w/ options non-chaptered in multiple parts, posting all chapters together, posting chapters in multiple parts, posting multiple chapters together */}
              <RadioGroup
                name='section-type'
                value={podfic.section_type}
                onChange={(e) =>
                  setPodfic((prev) => ({
                    ...prev,
                    section_type: e.target.value as SectionType,
                  }))
                }
              >
                <FormControlLabel
                  label='Non-chaptered work in multiple parts'
                  value={SectionType.SINGLE_TO_MULTIPLE}
                  control={<Radio />}
                />
                <FormControlLabel
                  label='All chapters in one part'
                  value={SectionType.MULTIPLE_TO_SINGLE}
                  control={<Radio />}
                />
                <FormControlLabel
                  label='Chapters split into multiple parts'
                  value={SectionType.CHAPTERS_SPLIT}
                  control={<Radio />}
                />
                <FormControlLabel
                  label='Multiple chapters in one part (currently unsupported)'
                  value={SectionType.CHAPTERS_COMBINE}
                  control={<Radio />}
                  disabled
                />
              </RadioGroup>
              {/* if single-to-multiple: add section and indicate name (default part 1, etc) & wordcount */}
              {/* if multiple-to-single: sections are created automatically for chapters */}
              {/* chapters-split: make sections for each chapter */}
              {/* chapters-combine: add section & indicate what chapters are in it. possibly allow overlap of 1...? */}
              {!!podfic.section_type &&
                podfic.section_type !== SectionType.MULTIPLE_TO_SINGLE && (
                  <>
                    {podfic.section_type === SectionType.CHAPTERS_SPLIT ? (
                      <>
                        {podfic.chapters?.map((chapter, chapterIndex) => (
                          <div className={styles.flexColumn} key={chapterIndex}>
                            <Typography variant='body1'>{`Chapter ${
                              chapter.chapter_number
                            }${
                              chapter.chapter_title
                                ? ` - ${chapter.chapter_title}`
                                : ''
                            }`}</Typography>
                            {sectionInfo[chapter.chapter_number]?.map(
                              (section, index) => (
                                <SectionForm
                                  key={index}
                                  sectionType={podfic.section_type}
                                  section={section}
                                  setSection={(value) => {
                                    setSectionInfo((prev) => {
                                      return {
                                        ...prev,
                                        [chapter.chapter_number]: prev[
                                          chapter.chapter_number
                                        ].map((s, i) => {
                                          return i === index ? value : s;
                                        }),
                                      };
                                    });
                                  }}
                                />
                              ),
                            )}
                            <Button
                              variant='contained'
                              startIcon={<Add />}
                              onClick={() =>
                                setSectionInfo((prev) => {
                                  // insert section at end of this chapter's sections
                                  const chapNumber = chapter.chapter_number;
                                  const newSection = {
                                    title: '',
                                    chapters: [{ chapter_number: chapNumber }],
                                  };
                                  const prevSections = prev[chapNumber];
                                  console.log({ chapNumber, prevSections });
                                  if (!prevSections)
                                    return {
                                      ...prev,
                                      [chapNumber]: [newSection],
                                    };
                                  return {
                                    ...prev,
                                    [chapNumber]: [...prevSections, newSection],
                                  };
                                })
                              }
                            >
                              Add Section
                            </Button>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {sectionInfo[1]?.map((section, index) => (
                          <div className={styles.flexRow} key={index}>
                            <SectionForm
                              sectionType={podfic.section_type}
                              section={section}
                              setSection={(value) =>
                                setSectionInfo((prev) => ({
                                  ...prev,
                                  1: prev[1].map((s, i) =>
                                    i === index ? value : s,
                                  ),
                                }))
                              }
                              chapters={podfic.chapters}
                            />
                            <IconButton
                              onClick={() =>
                                setSectionInfo((prev) => ({
                                  ...prev,
                                  1: prev[1].toSpliced(index, 1),
                                }))
                              }
                            >
                              <Close />
                            </IconButton>
                          </div>
                        ))}
                        <Button
                          variant='contained'
                          startIcon={<Add />}
                          onClick={() =>
                            setSectionInfo((prev) => ({
                              ...prev,
                              1: [
                                ...prev[1],
                                { number: prev[1].length + 1, title: '' },
                              ],
                            }))
                          }
                        >
                          Add Section
                        </Button>
                      </>
                    )}
                  </>
                )}
            </>
          )}
        </div>
      </DetailsWrapper>
    </div>
  );
}
