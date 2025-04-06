import styles from '@/app/forms/forms.module.css';
import { Typography } from '@mui/material';
import RecordingSessionForm from '../recording-session-form';

export default function Page({ params, searchParams }) {
  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>Edit Recording Session</Typography>
      <RecordingSessionForm
        recording_id={params.id}
        returnUrl={searchParams.return_url}
      />
    </div>
  );
}
