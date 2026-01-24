import { Typography } from '@mui/material';
import { Metadata } from 'next';
import styles from '@/app/dashboard/dashboard.module.css';
import BingoPage from './BingoPage';

export const metadata: Metadata = {
  title: 'Bingos',
};

export default function Page() {
  return (
    <div className={`${styles.body} ${styles.flexColumn}`}>
      <Typography variant='h4'>Bingos</Typography>
      <BingoPage />
    </div>
  );
}
