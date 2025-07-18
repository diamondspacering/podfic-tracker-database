import styles from '@/app/dashboard/dashboard.module.css';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import ToPodficTable from './ToPodficTable';

export default async function Page() {
  return (
    <div
      className={`${styles.body} ${styles.flexColumn}`}
      style={{ overflowX: 'scroll' }}
    >
      <Link href='/forms/podfic/new?return_url=/dashboard/to-podfic'>
        <Button
          variant='contained'
          startIcon={<Add />}
          style={{
            marginBottom: '2rem',
          }}
        >
          New Podfic
        </Button>
      </Link>
      <br />
      <br />
      <ToPodficTable />
    </div>
  );
}
