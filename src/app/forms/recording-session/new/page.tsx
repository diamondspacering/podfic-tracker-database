import { Typography } from '@mui/material';
import RecordingSessionForm from '../recording-session-form';
import styles from '@/app/forms/forms.module.css';

export default function Page({ searchParams }) {
  const podficId = searchParams.podfic_id
    ? parseInt(searchParams.podfic_id)
    : null;
  const chapterId = searchParams.chapter_id
    ? parseInt(searchParams.chapter_id)
    : null;
  const partId = searchParams.part_id ? parseInt(searchParams.part_id) : null;
  const sectionId = searchParams.section_id
    ? parseInt(searchParams.section_id)
    : null;
  const returnUrl = searchParams.return_url;

  return (
    <div className={styles.flexColumn}>
      <Typography variant='h3'>New Recording Session</Typography>
      <RecordingSessionForm
        podfic_id={podficId}
        chapter_id={chapterId}
        part_id={partId}
        section_id={sectionId}
        returnUrl={returnUrl}
      />
    </div>
  );
}
