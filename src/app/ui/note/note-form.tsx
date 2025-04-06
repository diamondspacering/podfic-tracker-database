import styles from '@/app/forms/forms.module.css';
import { TextField } from '@mui/material';

export default function NoteForm({ note, setNote }) {
  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <TextField
        size='small'
        label='Label'
        autoFocus
        value={note.label ?? ''}
        onChange={(e) =>
          setNote((prev) => ({ ...prev, label: e.target.value }))
        }
      />
      <TextField
        multiline
        size='small'
        label='value'
        value={note.value ?? ''}
        onChange={(e) =>
          setNote((prev) => ({ ...prev, value: e.target.value }))
        }
      />
    </div>
  );
}
