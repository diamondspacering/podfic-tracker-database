import styles from '@/app/forms/forms.module.css';
import { PermissionStatus } from '@/app/types';
import StatusSelect from '@/app/ui/StatusSelect';
import { TextField } from '@mui/material';
import { useEffect } from 'react';

interface AuthorFormProps {
  author: Author;
  setAuthor: React.Dispatch<React.SetStateAction<Author>>;
}

export default function AuthorForm({ author, setAuthor }: AuthorFormProps) {
  useEffect(() => {
    setAuthor((prev) => ({ ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.flexRow}>
      <TextField
        size='small'
        label='username'
        value={author.username}
        onChange={(e) =>
          setAuthor((prev) => ({ ...prev, username: e.target.value }))
        }
      />
      <TextField
        size='small'
        label='AO3'
        value={author.ao3}
        onChange={(e) =>
          setAuthor((prev) => ({ ...prev, ao3: e.target.value }))
        }
      />
      {/* TODO: fix types here */}
      <StatusSelect
        type='permission'
        value={author.permission_status as unknown as PermissionStatus}
        setValue={(val) =>
          setAuthor((prev) => ({
            ...prev,
            permission_status: val as any,
          }))
        }
      />
      <TextField
        size='small'
        label='Primary Social Media'
        value={author.primary_social_media}
        onChange={(e) =>
          setAuthor((prev) => ({
            ...prev,
            primary_social_media: e.target.value,
          }))
        }
      />
      <TextField
        size='small'
        label='Permission Ask Link'
        value={author.permission_ask}
        onChange={(e) =>
          setAuthor((prev) => ({
            ...prev,
            permission_ask: e.target.value,
          }))
        }
      />
    </div>
  );
}
