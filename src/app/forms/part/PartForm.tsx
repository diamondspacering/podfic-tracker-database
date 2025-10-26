'use client';

import { usePart, usePodficcers, usePodficsFull } from '@/app/lib/swrLoaders';
import { createUpdatePartData } from '@/app/lib/updaters';
import { PartStatus, PodficType } from '@/app/types';
import StatusSelect from '@/app/ui/StatusSelect';
import {
  Autocomplete,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '@/app/forms/forms.module.css';
import DatePicker from '@/app/ui/DatePicker';
import { Add } from '@mui/icons-material';
import PodficcerDialog from '@/app/ui/podficcer/podficcer-dialog';
import PodficForm from '../podfic/podfic-form';

export default function PartForm({ part_id = null, returnUrl = null }) {
  const router = useRouter();
  const { podfics, isLoading: podficsLoading } = usePodficsFull({});
  const { part, isLoading: partLoading } = usePart(part_id);
  const { podficcers, isLoading: podficcersLoading } = usePodficcers();

  const [partId] = useState<number | null>(part_id);

  const [selectedPodfic, setSelectedPodfic] = useState({} as Podfic & Work);
  const [selectedChapter, setSelectedChapter] = useState({} as Chapter);

  const [doc, setDoc] = useState('');
  const [organizerId, setOrganizerId] = useState(null);
  const [podficId, setPodficId] = useState(null);
  const [isNewPodfic, setIsNewPodfic] = useState(false);
  const [newPodfic, setNewPodfic] = useState({
    type: PodficType.MULTIVOICE,
  } as Podfic & Work);
  const [chapterId, setChapterId] = useState(null);
  const [words, setWords] = useState('');
  const [status, setStatus] = useState<PartStatus>(PartStatus.PICKED);
  const [partName, setPartName] = useState('');
  const [deadline, setDeadline] = useState('');

  const [podficcerDialogOpen, setPodficcerDialogOpen] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(true);

  useEffect(() => {
    if (!partLoading) {
      // console.log('setting part & podfics');
      if (part.doc) setDoc(part.doc);
      if (part.organizer) setOrganizerId(part.organizer);
      if (part.podfic_id) setPodficId(part.podfic_id);
      if (part.chapter_id) setChapterId(part.chapter_id);
      if (part.words) setWords(part.words?.toString());
      if (part.status) setStatus(part.status);
      if (part.part) setPartName(part.part);
      if (part.deadline) setDeadline(part.deadline);
    }
  }, [partLoading, part]);

  useEffect(() => {
    if (!podficsLoading && !!podficId) {
      const podfic = podfics.find((p) => p.podfic_id === podficId);
      if (!!podfic) setSelectedPodfic(podfic);
      if (!!podfic && !!chapterId) {
        const chapter = podfic.chapters.find((c) => c.chapter_id === chapterId);
        if (!!chapter) setSelectedChapter(chapter);
      }
    }
  }, [podficsLoading, podfics, podficId, chapterId]);

  return (
    <>
      <PodficcerDialog
        isOpen={podficcerDialogOpen}
        onClose={() => setPodficcerDialogOpen(false)}
        submitCallback={(podficcer) => {
          if (isOrganizer) setOrganizerId(podficcer.podficcer_id);
          setPodficcerDialogOpen(false);
        }}
      />

      <div className={styles.flexColumn}>
        <TextField
          size='small'
          label='Doc'
          value={doc}
          onChange={(e) => setDoc(e.target.value)}
        />

        <Autocomplete
          size='small'
          options={podficcers ?? []}
          loading={podficcersLoading}
          getOptionLabel={(option) => option?.username ?? ''}
          sx={{
            width: '200px',
          }}
          value={
            podficcers?.find(
              (podficcer) => podficcer.podficcer_id === organizerId
            ) ?? { podficcer_id: null, username: '' }
          }
          onChange={(_, newValue) => setOrganizerId(newValue?.podficcer_id)}
          renderInput={(params) => (
            <TextField {...params} size='small' label='Podficcer&nbsp;&nbsp;' />
          )}
        />
        <Button
          onClick={() => {
            setPodficcerDialogOpen(true);
            setIsOrganizer(true);
          }}
          startIcon={<Add />}
        >
          New Podficcer
        </Button>

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
          <Autocomplete
            options={podfics ?? []}
            loading={podficsLoading}
            getOptionLabel={(option) => option?.title ?? ''}
            sx={{
              width: '300px',
            }}
            value={selectedPodfic}
            onChange={(_, newValue) => {
              setPodficId(newValue?.podfic_id);
              // setSelectedPodfic(newValue);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                size='small'
                label='Podfic&nbsp;&nbsp;'
              />
            )}
          />
        )}

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
              options={selectedPodfic?.chapters ?? []}
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
          </div>
        )}

        <div className={styles.flexRow}>
          <TextField
            size='small'
            label='Words'
            value={words}
            onChange={(e) => setWords(e.target.value)}
          />
          <TextField
            size='small'
            label='Part'
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
          />
        </div>

        <div className={styles.flexRow}>
          <StatusSelect
            type='part'
            value={status}
            setValue={(value) => setStatus(value)}
          />
          <DatePicker
            label='Deadline'
            value={deadline}
            onChange={(val) => setDeadline(val)}
          />
        </div>

        <Button
          variant='contained'
          onClick={async () => {
            try {
              await createUpdatePartData({
                part_id: partId,
                ...(isNewPodfic ? { podficData: newPodfic } : {}),
                doc,
                organizer: organizerId,
                podfic_id: podficId,
                chapter_id: chapterId,
                words: words ? parseInt(words) : null,
                part: partName,
                deadline,
                status,
              });
              router.push(returnUrl ?? `/dashboard/parts`);
            } catch (e) {
              console.error('Error submitting part:', e);
            }
          }}
        >
          Submit
        </Button>
      </div>
    </>
  );
}
