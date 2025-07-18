'use client';

import { FileType, getDefaultLength } from '@/app/types';
import DurationPicker from '@/app/ui/DurationPicker';
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import React, { useEffect, useMemo } from 'react';
import styles from '@/app/forms/forms.module.css';
import { Add } from '@mui/icons-material';
import FileLinkForm from './file-link-form';

interface FileFormProps {
  file?: File;
  setFile?: React.Dispatch<React.SetStateAction<File>>;
  podficTitle?: string;
  chapterId?: number;
  existingLength?: Length;
}

export default function FileForm({
  file,
  setFile,
  podficTitle,
  chapterId,
  existingLength,
}: FileFormProps) {
  const length = useMemo(
    () => file?.length ?? existingLength ?? getDefaultLength(),
    [file, existingLength]
  );

  useEffect(() => setFile({ ...file }), []);

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <TextField
        size='small'
        label='Label'
        value={file.label}
        onChange={(e) =>
          setFile((prev) => ({ ...prev, label: e.target.value }))
        }
      />
      <DurationPicker
        value={length}
        onChange={(lengthVal) =>
          setFile((prev) => ({ ...prev, length: lengthVal }))
        }
      />
      <div className={`${styles.flexRow} ${styles.center}`}>
        <TextField
          size='small'
          label='Size'
          sx={{
            width: '100px',
          }}
          value={file.size?.toString() ?? ''}
          onChange={(e) =>
            setFile((prev) => ({ ...prev, size: parseInt(e.target.value) }))
          }
        />
        <span>
          <b>MB</b>
        </span>
      </div>
      <TextField
        select
        size='small'
        label='File Type'
        value={file.filetype}
        onChange={(e) =>
          setFile((prev) => ({ ...prev, filetype: e.target.value as FileType }))
        }
      >
        {Object.keys(FileType).map((type) => (
          <MenuItem key={type} value={FileType[type]}>
            {type}
          </MenuItem>
        ))}
      </TextField>
      <FormControlLabel
        label='Is plain version'
        control={
          <Checkbox
            checked={file.is_plain}
            onChange={(e) =>
              setFile((prev) => ({ ...prev, is_plain: e.target.checked }))
            }
          />
        }
      />

      {/* <Button variant='contained' onClick={() => console.log({ links })}>
        log links
      </Button> */}
      {file?.links?.map((link, index) => (
        <FileLinkForm
          key={index}
          link={link}
          setLink={(val) =>
            setFile((prev) => ({
              ...prev,
              links: prev.links.map((l, i) => (index === i ? val : l)),
            }))
          }
          podficTitle={podficTitle}
          chapterId={chapterId}
          label={file.label}
        />
      ))}
      <Button
        variant='contained'
        startIcon={<Add />}
        onClick={() =>
          setFile((prev) => ({
            ...prev,
            links: [...(prev.links ?? []), { is_direct: true } as FileLink],
          }))
        }
      >
        Add Link
      </Button>
    </div>
  );
}
