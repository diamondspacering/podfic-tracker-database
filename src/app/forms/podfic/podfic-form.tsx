'use client';

import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import styles from '@/app/forms/forms.module.css';
import { Add } from '@mui/icons-material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import FandomForm from './fandom-form';
import AuthorForm from './author-form-inline';
import { PodficStatus, PodficType } from '@/app/types';
import { formatDateString, formatDateTimeString } from '@/app/lib/format';
import StatusSelect from '@/app/ui/StatusSelect';
import DatePicker from '@/app/ui/DatePicker';
import SeriesForm from './series-form';
import { usePodficcers } from '@/app/lib/swrLoaders';
import PodficcerDialog from '@/app/ui/podficcer/podficcer-dialog';
import TagSelect from '@/app/ui/TagSelect';

interface PodficFormProps {
  podfic: Podfic & Work;
  setPodfic: React.Dispatch<React.SetStateAction<Podfic & Work>>;
}

export default function PodficForm({ podfic, setPodfic }: PodficFormProps) {
  const [isNewWork, setIsNewWork] = useState(true);
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
  const [isMultivoice, setIsMultivoice] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [series, setSeries] = useState<Series[]>([]);
  const [isNewSeries, setIsNewSeries] = useState(false);
  const [wordcount, setWordcount] = useState('');
  const [isBackDated, setIsBackDated] = useState(false);

  const [podficcerDialogOpen, setPodficcerDialogOpen] = useState(false);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorsLoading, setAuthorsLoading] = useState(true);
  const [isNewAuthor, setIsNewAuthor] = useState(false);

  const { podficcers, isLoading: podficcersLoading } = usePodficcers();

  // TODO: make it default type of podfic

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
  }, [podfic.added_date]);

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
  }, []);

  useEffect(() => {
    if (!isNewWork) fetchWorks();
  }, [isNewWork, fetchWorks]);

  // NOTE: This seems to be necessary because of MUI components not handling controlled state very well
  useEffect(() => {
    setPodfic((prev) => ({
      ...prev,
    }));
  }, []);

  useEffect(() => {
    setWordcount(podfic.wordcount?.toString());
  }, [podfic.wordcount]);

  const isVoiceteam = useMemo(
    () =>
      podfic.event_id &&
      events
        ?.find((event) => event.event_id === podfic.event_id)
        ?.parent_name?.includes('Voiceteam'),
    [podfic.event_id, events]
  );

  useEffect(() => {
    if (isVoiceteam) fetchChallengesAndProjects(podfic.event_id);
  }, [isVoiceteam, podfic.event_id, fetchChallengesAndProjects]);

  useEffect(() => {
    if (isVoiceteam && podfic.vt_project_id && !challengesLoading) {
      const id = projects.find(
        (project) => project.vt_project_id === podfic.vt_project_id
      )?.challenge_id;
      setChallengeId(id ?? null);
    }
  }, [isVoiceteam, podfic.vt_project_id, challengesLoading, projects]);

  // TODO: consider a full FormControl for required fields & stuff?
  return (
    <div>
      <PodficcerDialog
        isOpen={podficcerDialogOpen}
        onClose={() => setPodficcerDialogOpen(false)}
        submitCallback={(podficcer) => {
          setPodfic((prev) => ({
            ...prev,
            podficcers: [...(prev.podficcers ?? []), podficcer],
          }));
          setPodficcerDialogOpen(false);
        }}
      />
      <Button variant='contained' onClick={() => console.log({ podfic })}>
        Log podfic
      </Button>
      <Button variant='contained' onClick={() => console.log({ events })}>
        Log events
      </Button>
      <Button variant='contained' onClick={() => console.log({ challenges })}>
        Log challenges
      </Button>
      <Typography variant='h5'>Work</Typography>
      <br />
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
                  } as any)
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
        <FormControlLabel
          label='Pull metadata from AO3?'
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
        ></FormControlLabel>
      </div>
      <br />
      <Typography variant='h6'>Metadata</Typography>
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
                (author) => author.author_id === podfic.author_id
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
          {isNewAuthor ? (
            <AuthorForm
              updateCallback={async (val) => {
                await fetchAuthors();
                setPodfic((prev) => ({ ...prev, author_id: val }));
                setIsNewAuthor(false);
              }}
            />
          ) : (
            <Button onClick={() => setIsNewAuthor(true)} startIcon={<Add />}>
              New Author
            </Button>
          )}
        </div>
        <div className={styles.flexColumn}>
          <Autocomplete
            size='small'
            loading={fandomsLoading}
            options={fandoms}
            value={
              fandoms?.find(
                (fandom) => fandom.fandom_id === podfic.fandom_id
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
            <Button onClick={() => setIsNewFandom(true)} startIcon={<Add />}>
              New Fandom
            </Button>
          )}
        </div>
      </div>
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
      {/* end metadata */}

      <br />
      <br />

      <Typography variant='h6'>Project Info</Typography>
      <div className={styles.flexColumn}>
        <div className={styles.flexRow}>
          <StatusSelect
            value={podfic.status ?? ''}
            setValue={(val) => setPodfic((prev) => ({ ...prev, status: val }))}
            type='podfic'
          />
          {podfic.status === PodficStatus.POSTED && (
            <DatePicker
              label='Posted Date'
              value={podfic.posted_date ?? ''}
              onChange={(val) => {
                console.log({ val });
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
            <Button onClick={() => setIsNewSeries(true)} startIcon={<Add />}>
              New Series
            </Button>
          )}
        </div>
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
          {/* TODO: consider creating a project from this page? */}
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
                    (challenge) => challenge.challenge_id === challengeId
                  ) ?? ({ challenge_id: 0, challenge_name: '' } as Challenge)
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
                    (project) => project.vt_project_id === podfic.vt_project_id
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
        <>
          <TextField
            size='small'
            select
            sx={{
              width: '200px',
            }}
            label={'Type'}
            value={podfic.type}
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
          <FormControlLabel
            label='Is multivoice?'
            control={
              <Checkbox
                checked={isMultivoice}
                onChange={(e) => setIsMultivoice(e.target.checked)}
              />
            }
          />
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
          onClick={() => setPodficcerDialogOpen(true)}
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
      <Typography variant='h6'>Chapters</Typography>
      <div className={styles.flexRow}>
        <FormControlLabel
          label='Chaptered'
          control={
            <Checkbox
              checked={podfic.chaptered ?? false}
              value={podfic.chaptered ?? false}
              onChange={(e) =>
                setPodfic((prev) => ({ ...prev, chaptered: e.target.checked }))
              }
            />
          }
        />
        <FormControlLabel
          label='Posted unchaptered?'
          control={
            <Checkbox
              checked={podfic.posted_unchaptered ?? false}
              value={podfic.posted_unchaptered ?? false}
              onChange={(e) =>
                setPodfic((prev) => ({
                  ...prev,
                  posted_unchaptered: e.target.checked,
                }))
              }
            />
          }
        />
      </div>
    </div>
  );
}
