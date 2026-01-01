import styles from '@/app/dashboard/dashboard.module.css';
import PodficcerTable from '@/app/ui/table/PodficcerTable';
import { Typography } from '@mui/material';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Other',
};

export default function Page() {
  return (
    <div className={styles.body}>
      <Typography variant='h2'>Podficcers</Typography>
      <PodficcerTable />
    </div>
  );
}
