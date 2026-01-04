import styles from '@/app/dashboard/dashboard.module.css';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import PodficTable from './PodficTable';
import { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Podfics',
};

export default async function Page() {
  return (
    <Suspense>
      <div
        className={`${styles.body} ${styles.flexColumn}`}
        style={{
          overflowX: 'scroll',
        }}
      >
        <Link href='/forms/podfic/new'>
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
        <PodficTable />
      </div>
    </Suspense>
  );
}
