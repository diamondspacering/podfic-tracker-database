import styles from '@/app/forms/forms.module.css';
import { Typography } from '@mui/material';
import PartForm from '../PartForm';

export default function Page({ params, searchParams }) {
  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>Edit Part</Typography>
      <PartForm part_id={params.id} returnUrl={searchParams.return_url} />
    </div>
  );
}
