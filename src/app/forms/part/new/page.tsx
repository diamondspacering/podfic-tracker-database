import styles from '@/app/forms/forms.module.css';
import { Typography } from '@mui/material';
import PartForm from '../PartForm';

export default function Page({ searchParams }) {
  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>New Part</Typography>
      <PartForm returnUrl={searchParams.return_url} />
    </div>
  );
}
