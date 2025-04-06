import Link from 'next/link';
import styles from './forms.module.css';
import { IconButton } from '@mui/material';
import { Home } from '@mui/icons-material';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Link href='/dashboard'>
        <IconButton>
          <Home />
        </IconButton>
      </Link>
      <div className={styles.formBody}>{children}</div>
    </div>
  );
}
