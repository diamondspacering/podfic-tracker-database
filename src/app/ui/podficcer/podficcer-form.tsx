import { TextField } from '@mui/material';
import styles from '@/app/forms/forms.module.css';

export default function PodficcerForm({ podficcer, setPodficcer }) {
  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <TextField
        size='small'
        label='Username'
        value={podficcer.username ?? ''}
        onChange={(e) =>
          setPodficcer((prev) => ({ ...prev, username: e.target.value }))
        }
      />
      <TextField
        label='Name'
        value={podficcer.name ?? ''}
        onChange={(e) =>
          setPodficcer((prev) => ({ ...prev, name: e.target.value }))
        }
      />
      <TextField
        label='Profile'
        value={podficcer.profile ?? ''}
        onChange={(e) =>
          setPodficcer((prev) => ({ ...prev, profile: e.target.value }))
        }
      />
    </div>
  );
}
