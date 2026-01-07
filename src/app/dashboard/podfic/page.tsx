import styles from '@/app/dashboard/dashboard.module.css';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import Link from 'next/link';
import { Suspense } from 'react';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
const PodficTable = dynamic(() => import('./PodficTable'), { ssr: false });

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
