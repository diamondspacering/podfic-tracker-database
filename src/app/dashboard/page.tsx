import { Button, Typography } from '@mui/material';
import styles from './dashboard.module.css';
import Link from 'next/link';
import { Add } from '@mui/icons-material';
import {
  fetchInProgressPodfics,
  fetchRecordedToday,
  fetchVoiceteams,
} from '../lib/loaders';
import StatusBadge from '../ui/StatusBadge';
import { getLengthText } from '../lib/format';

export default async function Page() {
  const inProgressPodfics = await fetchInProgressPodfics();
  const recordedToday = await fetchRecordedToday();
  const voiceteams = await fetchVoiceteams();

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

      {/* TODO: smarter way of doing this, dates for voiceteams? */}
      {new Date().getMonth() === 4 && (
        <>
          <a
            href={`/dashboard/voiceteam/${
              voiceteams.find((vt) => vt.year === new Date().getFullYear())
                .event_id
            }`}
          >
            Current Voiceteam
          </a>
          <br />
        </>
      )}

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
            gap: '5px',
          }}
        >
          <div>{`${podfic.title} - `}</div>
          <StatusBadge
            status={podfic.status}
            clickable
            linkTo={
              podfic.chaptered
                ? `/dashboard/chapters/${podfic.podfic_id}`
                : `/forms/podfic/${podfic.podfic_id}`
            }
          />
        </div>
      ))}
    </div>
  );
}
