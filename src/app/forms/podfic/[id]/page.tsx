'use client';

import { Typography } from '@mui/material';
import PodficForm from '@/app/forms/podfic/podfic-form';
import styles from '@/app/forms/forms.module.css';
import { useCallback, useEffect, useState } from 'react';
import { createUpdatePodficClient } from '@/app/lib/updaters';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@mui/lab';
import DurationPicker from '@/app/ui/DurationPicker';
import { PodficType, SectionType } from '@/app/types';
import { usePodficcer } from '@/app/lib/swrLoaders';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Podfic',
};

export default function Page({
  params,
  searchParams,
}: {
  params: { id: any };
  searchParams?: any;
}) {
  const { podficcer: defaultPodficcer } = usePodficcer(1);

  const [podfic, setPodfic] = useState({
    type: PodficType.PODFIC,
    podficcers: [defaultPodficcer],
    section_type: SectionType.DEFAULT,
  } as Podfic & Work);
  const [, setLoading] = useState(true);
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/db/podfics/${params.id}?with_podficcers=true&with_tags=true`).then(
      (res) => {
        res.json().then((data) => {
          if (Object.keys(data).length && params.id !== 'new') {
            console.log({ data });
            setPodfic(data);
          }
          setLoading(false);
        });
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPodfic = useCallback(async () => {
    // console.log({ podfic });
    setSubmitting(true);
    try {
      await createUpdatePodficClient(podfic);
      if (searchParams?.return_url) router.push(searchParams.return_url);
      else router.push('/dashboard/podfic');
    } catch (e) {
      console.error('Error submitting podfic:', e);
    } finally {
      setSubmitting(false);
    }
  }, [podfic, router, searchParams.return_url]);

  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>
        {podfic.podfic_id ? 'Edit' : 'New'} Podfic
      </Typography>
      <PodficForm podfic={podfic} setPodfic={setPodfic} />
      {!podfic.chaptered && (
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
