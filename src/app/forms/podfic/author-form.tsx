import { createUpdateAuthor } from '@/app/lib/updaters';
import { useCallback, useState } from 'react';
import styles from '@/app/forms/forms.module.css';
import { Button, CircularProgress, TextField } from '@mui/material';
import { Check } from '@mui/icons-material';

export default function AuthorForm({ updateCallback }) {
  const [username, setUsername] = useState('');

  const [submitting, setSubmitting] = useState(false);

  const submitAuthor = useCallback(async () => {
    setSubmitting(true);

    try {
      const newAuthor = await createUpdateAuthor({ username });
      await updateCallback(newAuthor.author_id);
    } catch (e) {
      console.error('Error creating new author:', e);
    } finally {
      setSubmitting(false);
    }
  }, [username, updateCallback]);

  return (
    <div className={`${styles.chapterDiv} ${styles.flexRow}`}>
      <TextField
        size='small'
        label='Username'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button onClick={submitAuthor}>
        {submitting ? <CircularProgress /> : <Check />}
      </Button>
    </div>
  );
}
