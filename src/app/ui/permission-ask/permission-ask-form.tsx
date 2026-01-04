import styles from '@/app/forms/forms.module.css';
import { useAuthors, useWorks } from '@/app/lib/swrLoaders';
import { PermissionAskStatus } from '@/app/types';
import { Autocomplete, Button, MenuItem, TextField } from '@mui/material';
import { useEffect, useMemo } from 'react';
import StatusBadge from '../StatusBadge';
import DatePicker from '../DatePicker';
import { socialMedia } from '@/app/lib/dataGeneral';

interface PermissionAskProps {
  permissionAsk: Permission;
  setPermissionAsk: React.Dispatch<React.SetStateAction<Permission>>;
}

export default function PermissionAskForm({
  permissionAsk,
  setPermissionAsk,
}: PermissionAskProps) {
  const { authors, isLoading: authorsLoading } = useAuthors();
  const { works, isLoading: worksLoading } = useWorks();

  const filteredWorks = useMemo(
    () =>
      !permissionAsk.author_id
        ? works
        : works.filter((work) => work.author_id === permissionAsk.author_id),
    [permissionAsk.author_id, works]
  );

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <Button
        variant='contained'
        onClick={() => console.log({ permissionAsk })}
      >
        log
      </Button>
      <Autocomplete
        size='small'
        options={authors}
        sx={{
          width: '200px',
        }}
        loading={authorsLoading}
        value={authors.find(
          (author) => author.author_id === permissionAsk.author_id
        )}
        isOptionEqualToValue={(option, value) => {
          return option.author_id === value.author_id;
        }}
        getOptionLabel={(option) => option?.username ?? '(unknown)'}
        onChange={(_, newValue) =>
          setPermissionAsk((prev) => ({
            ...prev,
            author_id: newValue?.author_id ?? null,
          }))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            size='small'
            label='Author&nbsp;&nbsp;&nbsp;'
          />
        )}
      />
      <Autocomplete
        size='small'
        sx={{ width: '200px' }}
        loading={worksLoading}
        options={filteredWorks}
        value={filteredWorks.find(
          (work) => work.work_id === permissionAsk.work_id
        )}
        isOptionEqualToValue={(option, value) =>
          option.work_id === value.work_id
        }
        getOptionLabel={(option) =>
          option?.nickname ?? option?.title ?? '(unknown)'
        }
        onChange={(_, newValue) =>
          setPermissionAsk((prev) => ({
            ...prev,
            work_id: newValue?.work_id ?? null,
            author_id: newValue?.author_id ?? prev.author_id,
          }))
        }
        renderInput={(params) => (
          <TextField {...params} size='small' label='Work&nbsp;&nbsp;&nbsp;' />
        )}
      />
      <TextField
        select
        size='small'
        sx={{
          width: '175px',
        }}
        value={permissionAsk.permission_status}
        onChange={(e) =>
          setPermissionAsk((prev) => ({
            ...prev,
            permission_status: e.target.value as PermissionAskStatus,
          }))
        }
        label='Status'
      >
        {Object.values(PermissionAskStatus).map((status) => (
          <MenuItem key={status} value={status}>
            <StatusBadge status={status} />
          </MenuItem>
        ))}
      </TextField>

      <DatePicker
        value={permissionAsk.asked_date}
        onChange={(val) =>
          setPermissionAsk((prev) => ({ ...prev, asked_date: val }))
        }
        label='Asked Date'
      />
      <TextField
        size='small'
        value={permissionAsk.ask_link}
        onChange={(e) =>
          setPermissionAsk((prev) => ({ ...prev, ask_link: e.target.value }))
        }
        label='Ask link'
      />
      <TextField
        size='small'
        select
        sx={{
          width: '130px',
        }}
        value={permissionAsk.ask_medium}
        onChange={(e) =>
          setPermissionAsk((prev) => ({ ...prev, ask_medium: e.target.value }))
        }
        label='Ask Medium'
      >
        {socialMedia.map((sm) => (
          <MenuItem key={sm} value={sm}>
            {sm}
          </MenuItem>
        ))}
      </TextField>

      <DatePicker
        value={permissionAsk.response_date}
        onChange={(val) =>
          setPermissionAsk((prev) => ({ ...prev, response_date: val }))
        }
        label='Response Date'
      />
    </div>
  );
}
