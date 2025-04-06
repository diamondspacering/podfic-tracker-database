'use client';

import { Typography } from '@mui/material';
import RecordingSessionForm from '../recording-session-form';
import styles from '@/app/forms/forms.module.css';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const podficId = searchParams.get('podfic_id')
    ? parseInt(searchParams.get('podfic_id'))
    : null;
  const chapterId = searchParams.get('chapter_id')
    ? parseInt(searchParams.get('chapter_id'))
    : null;
  const partId = searchParams.get('part_id')
    ? parseInt(searchParams.get('part_id'))
    : null;
  const returnUrl = searchParams.get('return_url');

  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>New Recording Session</Typography>
      <RecordingSessionForm
        podfic_id={podficId}
        chapter_id={chapterId}
        part_id={partId}
        returnUrl={returnUrl}
      />
    </div>
  );
}
