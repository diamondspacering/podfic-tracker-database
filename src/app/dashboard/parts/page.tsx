import styles from '@/app/dashboard/dashboard.module.css';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import PartsTable from './PartsTable';

export default function Page() {
  return (
    <div
      className={`${styles.body} ${styles.flexColumn}`}
      style={{ overflowX: 'scroll' }}
    >
      <Link href='/forms/part/new'>
        <Button
          variant='contained'
          startIcon={<Add />}
          style={{ marginBottom: '2rem' }}
        >
          New Part
        </Button>
      </Link>
      <br />
      <br />
      <PartsTable />
    </div>
  );
}
