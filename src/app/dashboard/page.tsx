import { Button, Typography } from '@mui/material';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { Add } from '@mui/icons-material';
import { fetchInProgressPodfics, fetchRecordedToday } from '../lib/loaders';
import StatusBadge from '../ui/StatusBadge';
import { getLengthText } from '../lib/format';

export default async function Page() {
  const inProgressPodfics = await fetchInProgressPodfics();
  const recordedToday = await fetchRecordedToday();

  return (
    <div className={styles.body}>
      <Typography variant='h1'>Podfic Tracker Dashboard</Typography>
      <Link href='/forms/recording-session/new'>
        <Button variant='contained' startIcon={<Add />}>
          New Recording Session
        </Button>
      </Link>
      <Link href='/forms/podfic/new'>
        <Button variant='contained' startIcon={<Add />}>
          New Podfic
        </Button>
      </Link>

      <br />
      <br />

      <Typography variant='h4'>Recorded Today</Typography>
      <span>
        {getLengthText(recordedToday?.sum)} over {recordedToday?.count ?? 0}{' '}
        sessions
      </span>
      <br />
      <br />

      <Typography variant='h4'>In Progress</Typography>
      {inProgressPodfics.map((podfic) => (
        <div
          key={podfic.podfic_id}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {podfic.title} - <StatusBadge status={podfic.status} />
        </div>
      ))}
    </div>
  );
}
