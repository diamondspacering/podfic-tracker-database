'use client';

import {
  usePart,
  usePodficcers,
  usePodficsFull,
  useSectionForPart,
} from '@/app/lib/swrLoaders';
import { createUpdatePartData, createUpdateSection } from '@/app/lib/updaters';
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
  // TODO: support multiple sections per part
  const { section, isLoading: sectionLoading } = useSectionForPart(part_id);
  const { podficcers, isLoading: podficcersLoading } = usePodficcers();

  const [partId] = useState<number | null>(part_id);

  const [selectedPodfic, setSelectedPodfic] = useState({} as Podfic & Work);
  const [selectedChapter, setSelectedChapter] = useState({} as Chapter);

  const [sectionData, setSectionData] = useState({} as Section);

  const [organizerId, setOrganizerId] = useState(null);
  const [podficId, setPodficId] = useState(null);
  const [isNewPodfic, setIsNewPodfic] = useState(false);
  const [newPodfic, setNewPodfic] = useState({
    type: PodficType.MULTIVOICE,
  } as Podfic & Work);
  const [chapterId, setChapterId] = useState(null);
  const [status, setStatus] = useState<PartStatus>(PartStatus.PICKED);
  const [partName, setPartName] = useState('');
  const [deadline, setDeadline] = useState('');

  const [podficcerDialogOpen, setPodficcerDialogOpen] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(true);

  useEffect(() => {
    if (!partLoading) {
      // console.log('setting part & podfics');
      if (part.organizer) setOrganizerId(part.organizer);
      if (part.podfic_id) setPodficId(part.podfic_id);
      if (part.chapter_id) setChapterId(part.chapter_id);
      if (part.status) setStatus(part.status);
      if (part.part) setPartName(part.part);
      if (part.deadline) setDeadline(part.deadline);
    }
  }, [partLoading, part]);

  useEffect(() => {
    if (!sectionLoading) {
      setSectionData(section);
    }
  }, [sectionLoading, section]);

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
          value={sectionData.text_link}
          onChange={(e) =>
            setSectionData((prev) => ({ ...prev, text_link: e.target.value }))
          }
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

        {/* TODO: respect sections for this, etc. */}
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
            value={sectionData.wordcount}
            onChange={(e) =>
              setSectionData((prev) => ({
                ...prev,
                wordcount: parseInt(e.target.value),
              }))
            }
          />
          <TextField
            size='small'
            label='Part'
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
          />
        </div>

        {/* TODO: section status */}
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
              const newPartId = await createUpdatePartData({
                part_id: partId,
                ...(isNewPodfic ? { podficData: newPodfic } : {}),
                organizer: organizerId,
                podfic_id: podficId,
                chapter_id: chapterId,
                part: partName,
                status,
              });
              await createUpdateSection({
                ...sectionData,
                part_id: newPartId,
                podfic_id: podficId,
                deadline,
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
