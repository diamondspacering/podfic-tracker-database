import styles from '@/app/forms/forms.module.css';
import { Typography } from '@mui/material';
import PartForm from '../PartForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Part',
};

export default function Page({ params, searchParams }) {
  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>Edit Part</Typography>
      <PartForm part_id={params.id} returnUrl={searchParams.return_url} />
    </div>
  );
}
