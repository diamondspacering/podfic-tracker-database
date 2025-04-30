'use client';

import { Button, TextField, Typography } from '@mui/material';
import PodficForm from '@/app/forms/podfic/podfic-form';
import styles from '@/app/forms/forms.module.css';
import { useCallback, useEffect, useState } from 'react';
import { createUpdatePodficClient } from '@/app/lib/updaters';
import ChapterForm from '../chapter-form';
import { Add } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@mui/lab';
import DurationPicker from '@/app/ui/DurationPicker';
import { PodficType } from '@/app/types';
import { usePodficcer } from '@/app/lib/swrLoaders';

export default function Page({ params }: { params: { id: any } }) {
  const { podficcer: defaultPodficcer } = usePodficcer(1);

  // TODO: use swr instead
  const [podfic, setPodfic] = useState({
    type: PodficType.PODFIC,
    podficcers: [defaultPodficcer],
  } as Podfic & Work);
  // TODO: loading state
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/db/podfics/${params.id}?with_podficcers=true`).then((res) => {
      res.json().then((data) => {
        if (Object.keys(data).length && params.id !== 'new') {
          console.log({ data });
          setPodfic(data);
        }
        setLoading(false);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPodfic = useCallback(async () => {
    // console.log({ podfic });
    setSubmitting(true);
    try {
      await createUpdatePodficClient(podfic);
      router.push('/dashboard/podfic');
    } catch (e) {
      console.error('Error submitting podfic:', e);
    } finally {
      setSubmitting(false);
    }
  }, [podfic, router]);

  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>
        {podfic.podfic_id ? 'Edit' : 'New'} Podfic
      </Typography>
      <PodficForm podfic={podfic} setPodfic={setPodfic} />
      {podfic.chaptered && (
        <TextField
          size='small'
          sx={{
            width: '100px',
          }}
          label='Chapter Count'
          value={podfic.chapter_count ? podfic.chapter_count.toString() : ''}
          onChange={(e) =>
            setPodfic((prev) => ({
              ...prev,
              chapter_count: parseInt(e.target.value),
            }))
          }
        />
      )}
      {podfic.chapters?.map((chapter, index) => (
        <ChapterForm
          key={index}
          chapter={chapter}
          setChapter={
            !podfic.podfic_id
              ? (value) =>
                  setPodfic((prev) => ({
                    ...prev,
                    chapters: prev.chapters.map((chapter, ci) =>
                      index === ci ? value : chapter
                    ),
                  }))
              : null
          }
        />
      ))}
      {podfic.chaptered ? (
        <>
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
        </>
      ) : (
        <>
          <Typography variant='h6'>Length</Typography>
          <DurationPicker
            value={podfic.length ?? {}}
            onChange={(value) =>
              setPodfic((prev) => ({ ...prev, length: value }))
            }
          />
        </>
      )}

      <LoadingButton
        variant='contained'
        loading={submitting}
        onClick={submitPodfic}
      >
        Submit
      </LoadingButton>
    </div>
  );
}
