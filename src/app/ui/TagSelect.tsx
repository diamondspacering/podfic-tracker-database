import { Autocomplete, createFilterOptions, TextField } from '@mui/material';
import { useCallback, useState } from 'react';
import { mutate } from 'swr';
import { useTags } from '../lib/swrLoaders';

const filter = createFilterOptions<Tag>();

interface TagSelectProps {
  existingTags: Tag[];
  addToExistingTags: (tag: Tag) => void;
  setExistingTags?: (tags: Tag[]) => void;
  showExistingTags?: boolean;
  submitTagCallback?: (newTag: Tag) => void;
}

export default function TagSelect({
  existingTags,
  addToExistingTags,
  setExistingTags,
  showExistingTags,
}: TagSelectProps) {
  const { tags, isLoading: tagsLoading } = useTags();

  const [addingTag, setAddingTag] = useState(false);

  const addTag = useCallback(
    async (tag: string) => {
      try {
        setAddingTag(true);

        const result = await fetch(`/db/tags`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tag }),
        });
        const newTag = await result.json();
        await mutate('/db/tags');

        addToExistingTags(newTag);
      } catch (e) {
        console.error('Error adding tag:', e);
      } finally {
        setAddingTag(false);
      }
    },
    [addToExistingTags]
  );

  return (
    <Autocomplete
      size='small'
      sx={{
        minWidth: '200px',
      }}
      multiple
      freeSolo
      options={tags.filter(
        (tag) => !existingTags.find((t) => t.tag_id === tag.tag_id)
      )}
      loading={tagsLoading || addingTag}
      value={showExistingTags ? existingTags : []}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option?.tag
      }
      onChange={(_, newValue) => {
        const newTags = newValue.filter(
          (value) => typeof value === 'string' || value.tag.match(/Add ".*"/)
        );

        if (newTags.length) {
          const newTagContent = (
            typeof newTags[0] === 'string'
              ? newTags[0]
              : newTags[0].tag.match(/Add "(.*)"/)[1]
          )
            .trim()
            .toLowerCase();
          if (typeof newTags[0] === 'string') {
            const tagMatch = tags.find((t) => t.tag === newTagContent);
            if (
              tagMatch &&
              !existingTags.find((t) => t.tag_id === tagMatch.tag_id)
            ) {
              addToExistingTags(tagMatch);
              return;
            }
          }
          addTag(newTagContent);
        } else {
          if (showExistingTags && setExistingTags) {
            setExistingTags(newValue as Tag[]);
          } else addToExistingTags(newValue.pop() as Tag);
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params);

        const { inputValue } = params;
        const isExisting = options.some((option) => inputValue === option.tag);
        if (inputValue !== '' && !isExisting) {
          filtered.push({
            tag: `Add "${inputValue}"`,
          });
        }

        return filtered;
      }}
      renderInput={(params) => (
        <TextField {...params} size='small' label='Tags&nbsp;&nbsp;' />
      )}
    />
  );
}
