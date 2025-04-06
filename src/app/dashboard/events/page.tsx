import styles from '@/app/dashboard/dashboard.module.css';
import EventTable from '@/app/ui/table/EventTable';
import { Typography } from '@mui/material';

export default async function Page() {
  return (
    <div className={styles.body}>
      <Typography variant='h2'>Events</Typography>
      <EventTable />
    </div>
  );
}
