'use client';

import { updateRecordingData } from '@/app/lib/updaters';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import PodficForm from '../podfic/podfic-form';
import styles from '@/app/forms/forms.module.css';
import ChapterForm from '../podfic/chapter-form';
import { useRouter } from 'next/navigation';
import { locations } from '@/app/lib/dataPersonal';
import { devices } from '@/app/lib/dataPersonal';
import { mics } from '@/app/lib/dataPersonal';
import DurationPicker from '@/app/ui/DurationPicker';
import { Close } from '@mui/icons-material';
import { mutate } from 'swr';
import { formatDateString, formatDateStringMonthFirst } from '@/app/lib/format';
import { PodficType } from '@/app/types';

export default function RecordingSessionForm({
  podfic_id = null,
  chapter_id = null,
  part_id = null,
  recording_id = null,
  returnUrl = null,
}) {
  const [podficList, setPodficList] = useState<(Podfic & Work)[]>([]);
  const router = useRouter();

  const [date, setDate] = useState('');
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [length, setLength] = useState<Length>({} as Length);
  const [mic, setMic] = useState('');
  const [device, setDevice] = useState('');
  const [location, setLocation] = useState('');
  const [completesPodfic, setCompletesPodfic] = useState(false);
  const [completesChapter, setCompletesChapter] = useState(false);

  const [isNewPodfic, setIsNewPodfic] = useState(false);
  const [isNewChapter, setIsNewChapter] = useState(false);
  const [podficId, setPodficId] = useState<number | null>(podfic_id);
  const [selectedPodfic, setSelectedPodfic] = useState({
    type: PodficType.PODFIC,
  } as Podfic & Work);
  const [selectedPodficChapters, setSelectedPodficChapters] = useState<
    Chapter[]
  >([]);
  const [selectedChapter, setSelectedChapter] = useState({} as Chapter);
  const [chapterId, setChapterId] = useState<number | null>(chapter_id);
  const [newPodfic, setNewPodfic] = useState({
    type: PodficType.PODFIC,
  } as Podfic & Work);
  const [recordingId] = useState<number | null>(recording_id);
  const [partId, setPartId] = useState<number | null>(part_id);
  const [selectedPodficParts, setSelectedPodficParts] = useState<Part[]>([]);

  useEffect(() => {
    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    setDate(formattedDate);
  }, []);

  useEffect(() => console.log({ podficId }), [podficId]);
  useEffect(() => console.log({ chapterId }), [chapterId]);
  useEffect(() => console.log({ recordingId }), [recordingId]);

  useEffect(() => {
    const fetchPodfics = async () => {
      // TODO: I want a more minified one
      const response = await fetch('/db/podfics');
      const data = await response.json();
      setPodficList(data);
    };

    fetchPodfics();
  }, []);

  useEffect(() => {
    if (podficId) {
      setSelectedPodfic(
        podficList.find((podfic) => podfic.podfic_id === podficId) ??
          ({ type: PodficType.PODFIC } as Podfic & Work)
      );
    }
  }, [podficId, podficList]);

  useEffect(() => {
    if (chapterId) {
      setSelectedChapter(
        selectedPodficChapters.find(
          (chapter) => chapter.chapter_id === chapterId
        ) ?? ({} as Chapter)
      );
    }
  }, [chapterId, selectedPodficChapters]);

  useEffect(() => console.log({ date }), [date]);

  const fetchRecording = useCallback(async () => {
    const response = await fetch(`/db/recording_sessions/${recordingId}`);
    const data = await response.json();
    setPodficId(data.podfic_id ?? null);
    setChapterId(data.chapter_id ?? null);
    if (data.date) {
      setDate(formatDateString(new Date(data.date)));
      console.log(formatDateStringMonthFirst(new Date(data.date)));
    }
    setYear(data.year ?? '');
    setMonth(data.month ?? '');
    setMic(data.mic ?? '');
    setDevice(data.device ?? '');
    setLocation(data.location ?? '');
    setLength(data.length);
  }, [recordingId]);

  useEffect(() => {
    if (recordingId) {
      fetchRecording();
    }
  }, [recordingId, fetchRecording]);

  useEffect(() => {
    console.log({ selectedPodfic });
    if (selectedPodfic.chaptered) {
      setSelectedPodficChapters(
        selectedPodfic.chapters?.sort((a, b) =>
          a.chapter_number < b.chapter_number ? -1 : 1
        ) ?? ([] as Chapter[])
      );
    }
    if (selectedPodfic.parts) {
      setSelectedPodficParts(selectedPodfic.parts);
    }
  }, [selectedPodfic]);

  return (
    <>
      <Button
        variant='contained'
        onClick={() =>
          console.log({
            date,
            year,
            month,
            length,
            mic,
            device,
            location,
            completesPodfic,
            completesChapter,
            podficId,
            chapterId,
            newPodfic,
          })
        }
      >
        log
      </Button>
      <div className={styles.flexRow}>
        <TextField
          size='small'
          type='date'
          value={date}
          onChange={(e) => setDate(e.target.value)}
          label='Recording Date'
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setDate('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
            inputLabel: {
              shrink: true,
            },
          }}
        />
        <TextField
          size='small'
          value={year}
          onChange={(e) => setYear(e.target.value)}
          label='Single Year'
        />
        <TextField
          size='small'
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          label='Single Month'
        />
      </div>
      <DurationPicker value={length} onChange={setLength} />
      <div className={styles.flexRow}>
        <TextField
          select
          size='small'
          sx={{
            width: '20%',
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton tabIndex={-1} onClick={() => setMic('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          label='Mic'
          value={mic}
          onChange={(e) => setMic(e.target.value)}
        >
          {mics.map((mic) => (
            <MenuItem key={mic} value={mic}>
              {mic}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size='small'
          sx={{
            width: '20%',
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton tabIndex={-1} onClick={() => setDevice('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          label='Device'
          value={device}
          onChange={(e) => setDevice(e.target.value)}
        >
          {devices.map((device) => (
            <MenuItem key={device} value={device}>
              {device}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size='small'
          label='Location'
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{
            width: '20%',
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton tabIndex={-1} onClick={() => setLocation('')}>
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        >
          {locations.map((location) => (
            <MenuItem key={location} value={location}>
              {location}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <FormControlLabel
        label='New podfic'
        control={
          <Checkbox
            checked={isNewPodfic}
            onChange={(e) => setIsNewPodfic(e.target.checked)}
          />
        }
      />
      {isNewPodfic ? (
        <PodficForm podfic={newPodfic} setPodfic={setNewPodfic} />
      ) : (
        <div className={styles.flexColumn}>
          {/* TODO: sorting? */}
          <Autocomplete
            options={podficList}
            sx={{
              width: 300,
            }}
            slotProps={{
              popper: {
                style: {
                  width: 'fit-content',
                  minWidth: '500px',
                },
              },
            }}
            getOptionLabel={(option) => option.title ?? ''}
            value={
              podficList.find((podfic) => podfic.podfic_id === podficId) ??
              ({ type: PodficType.PODFIC } as Podfic & Work)
            }
            onChange={(_, newValue) => {
              setPodficId(newValue.podfic_id);
              setSelectedPodfic(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                label='Podfic&nbsp;&nbsp;&nbsp;'
              />
            )}
          />
          {selectedPodfic.chaptered && (
            <div>
              <Autocomplete
                sx={{
                  width: '500px',
                }}
                slotProps={{
                  popper: {
                    style: {
                      width: 'fit-content',
                      minWidth: '500px',
                    },
                  },
                }}
                options={selectedPodficChapters}
                getOptionLabel={(chapter) =>
                  `${chapter.chapter_number}${
                    chapter.chapter_title ? ` - ${chapter.chapter_title}` : ''
                  }`
                }
                value={selectedChapter}
                onChange={(_, newValue) => setChapterId(newValue.chapter_id)}
                renderInput={(params) => (
                  <TextField
                    sx={{ wordBreak: 'keep-all' }}
                    {...params}
                    label='Chapter'
                  />
                )}
              />
              <FormControlLabel
                label='New chapter'
                control={
                  <Checkbox
                    checked={isNewChapter}
                    onChange={(e) => setIsNewChapter(e.target.checked)}
                  />
                }
              />
              {isNewChapter && (
                <ChapterForm
                  chapter={{
                    podfic_id: podficId,
                    chapter_number: (selectedPodficChapters?.length ?? 0) + 1,
                  }}
                  setChapter={null}
                  idCallback={(chapter_id) => setChapterId(chapter_id)}
                />
              )}
            </div>
          )}
          {!!selectedPodficParts.length && (
            <Autocomplete
              sx={{
                width: '200px',
              }}
              options={selectedPodficParts}
              getOptionLabel={(part) => part.part ?? ''}
              value={
                selectedPodficParts.find((part) => part.part_id === partId) ??
                ({} as Part)
              }
              onChange={(_, newValue) => setPartId(newValue.part_id)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  sx={{ wordBreak: 'keep-all' }}
                  label='Part'
                />
              )}
            />
          )}
        </div>
      )}
      {/* end if new podfic */}
      <FormControlLabel
        label='Completes podfic?'
        control={
          <Checkbox
            checked={completesPodfic}
            onChange={(e) => setCompletesPodfic(e.target.checked)}
          />
        }
      />
      {selectedPodfic.chaptered && (
        <FormControlLabel
          label='Completes chapter?'
          control={
            <Checkbox
              checked={completesChapter}
              onChange={(e) => setCompletesChapter(e.target.checked)}
            />
          }
        />
      )}
      <Button
        variant='contained'
        onClick={async () => {
          try {
            await updateRecordingData({
              date,
              year,
              month,
              podficId,
              chapterId,
              partId,
              length,
              mic,
              device,
              location,
              completesPodfic,
              completesChapter,
              podfic: newPodfic,
            });
            if (returnUrl?.includes('chapter_id') && !!podficId) {
              await mutate(`/db/chapters/${podficId}`);
            }
            router.push(returnUrl ?? '/dashboard');
          } catch (e) {
            console.error('Error submitting recording session:', e);
          }
        }}
      >
        Submit
      </Button>
    </>
  );
}
