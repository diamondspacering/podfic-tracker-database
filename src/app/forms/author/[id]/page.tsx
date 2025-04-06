'use client';

import { createUpdateAuthorClient } from '@/app/lib/updaters';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import styles from '@/app/forms/forms.module.css';
import { Typography } from '@mui/material';
import AuthorForm from '../author-form';
import { LoadingButton } from '@mui/lab';

export default function Page({ params }: { params: { id: any } }) {
  // TODO: use SWR instead
  const [author, setAuthor] = useState({} as Author);
  // TODO: loading state
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/db/authors/${params.id}`).then((res) => {
      res.json().then((data) => {
        setAuthor(data);
        setLoading(false);
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitAuthor = useCallback(async () => {
    setSubmitting(true);
    try {
      await createUpdateAuthorClient(author);
      router.push('/dashboard/authors');
    } catch (e) {
      console.error('Error submitting author:', e);
    } finally {
      setSubmitting(false);
    }
  }, [author, router]);

  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>
        {author.author_id ? 'Edit' : 'New'} Author
      </Typography>
      <AuthorForm author={author} setAuthor={setAuthor} />
      <LoadingButton
        variant='contained'
        loading={submitting}
        onClick={submitAuthor}
      >
        Submit
      </LoadingButton>
    </div>
  );
}
