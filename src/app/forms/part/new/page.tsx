'use client';

import styles from '@/app/forms/forms.module.css';
import { Typography } from '@mui/material';
import PartForm from '../PartForm';
import { useSearchParams } from 'next/navigation';

export default function Page() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('return_url');

  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>New Part</Typography>
      <PartForm returnUrl={returnUrl} />
    </div>
  );
}
