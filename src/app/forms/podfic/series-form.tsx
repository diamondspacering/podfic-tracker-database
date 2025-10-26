import { createUpdateSeries } from '@/app/lib/updaters';
import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import styles from '@/app/forms/forms.module.css';
import { Button, CircularProgress, TextField } from '@mui/material';
import { Check } from '@mui/icons-material';

export default function SeriesForm({ updateCallback }) {
  const [name, setName] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const submitSeries = useCallback(async () => {
    setSubmitting(true);

    try {
      const seriesId = await createUpdateSeries({ name });
      await mutate('/db/series');
      updateCallback(seriesId);
    } catch (e) {
      console.error('Error creating new series:', e);
    } finally {
      setSubmitting(false);
    }
  }, [name, updateCallback]);

  return (
    <div className={`${styles.chapterDiv} ${styles.flexRow}`}>
      <TextField
        size='small'
        label='Name'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={submitSeries}>
        {submitting ? <CircularProgress /> : <Check />}
      </Button>
    </div>
  );
}
