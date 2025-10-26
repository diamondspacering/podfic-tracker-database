import { IconButton, TextField } from '@mui/material';
import styles from './ui.module.css';
import { Check, Close } from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { updateTag } from '../lib/updaters';

interface TagBadgeProps {
  tag: Tag;
  editable?: boolean;
  updateTagCallback?: (tag: Tag) => void;
  removeCallback?: () => void;
}

export default function TagBadge({
  tag,
  editable,
  updateTagCallback,
  removeCallback,
}: TagBadgeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tagValue, setTagValue] = useState(tag.tag);

  const updateTagValue = useCallback(async () => {
    if (tagValue.trim().toLowerCase() !== tag.tag) {
      const newTag = await updateTag(tag.tag_id, tagValue.trim().toLowerCase());
      updateTagCallback?.(newTag);
    }
    setIsEditing(false);
  }, [tag, tagValue, updateTagCallback]);

  return (
    <div
      className={`${styles.tagBadge} ${
        editable || !!removeCallback ? styles.clickable : ''
      }`}
      onClick={() => {
        if (!isEditing) setIsEditing(true);
      }}
    >
      {isEditing ? (
        <>
          <TextField
            size='small'
            variant='standard'
            style={{
              maxHeight: '19px',
            }}
            slotProps={{
              htmlInput: {
                style: {
                  padding: '4px 10px',
                },
              },
            }}
            value={tagValue}
            onChange={(e) => setTagValue(e.target.value)}
          />
          <IconButton onClick={updateTagValue}>
            <Check style={{ maxHeight: '15px' }} />
          </IconButton>
          <IconButton
            onClick={() => {
              setIsEditing(false);
              setTagValue(tag.tag);
            }}
          >
            <Close style={{ maxHeight: '15px' }} />
          </IconButton>
        </>
      ) : (
        <>
          <span>{tag.tag}</span>
          {!!removeCallback && !isEditing && (
            <IconButton
              style={{ padding: '0px', marginLeft: '5px' }}
              onClick={async (e) => {
                e.stopPropagation();
                removeCallback();
              }}
            >
              <Close />
            </IconButton>
          )}
        </>
      )}
    </div>
  );
}
