import {
  TagMappings,
  useFandomCategories,
  useFandoms,
} from '@/app/lib/swrLoaders';
import { getMappedItems, WorkMetadata } from './metadataHelpers';
import styles from '@/app/forms/forms.module.css';
import {
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { mutate } from 'swr';
import { Add, Check } from '@mui/icons-material';
import RemovableItem from './RemovableItem';
import { createUpdateFandom } from '@/app/lib/updaters';
import { Category, Rating } from '@/app/types';
import { LoadingButton } from '@mui/lab';

interface MetadataFormProps {
  metadata: Work & WorkMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<WorkMetadata & Work>>;
  tagMappings: TagMappings;
  localTagMappings: TagMappings;
  setLocalTagMappings: React.Dispatch<React.SetStateAction<TagMappings>>;
}

export default function MetadataForm({
  metadata,
  setMetadata,
  tagMappings,
  localTagMappings,
  setLocalTagMappings,
}: MetadataFormProps) {
  // oh but these boys.....they are wrecking my mega mapping...curses on all variables
  const { fandoms, isLoading: fandomsLoading } = useFandoms();
  const { categories, isLoading: categoriesLoading } = useFandomCategories();

  const [mappedFandomList, setMappedFandomList] = useState(
    getMappedItems(metadata.fandomList, tagMappings.fandom_mapping)
  );
  const [mappedRelationshipList, setMappedRelationshipList] = useState(
    getMappedItems(metadata.relationshipList, tagMappings.relationship_mapping)
  );
  const [mappedCharacterList, setMappedCharacterList] = useState(
    getMappedItems(metadata.characterList, tagMappings.character_mapping)
  );
  const [selectedFandom, setSelectedFandom] = useState('');
  const [submittingFandom, setSubmittingFandom] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState('');

  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [chapterMetadata, setChapterMetadata] = useState<Chapter[]>([]);

  const selectedFandomId = useMemo(
    () =>
      fandoms.find((fandom) => fandom.fandom_name === selectedFandom)
        ?.fandom_id ?? '',
    [fandoms, selectedFandom]
  );

  useEffect(() => console.log({ selectedFandom }));
  useEffect(() => console.log({ localTagMappings }), [localTagMappings]);

  useEffect(() => {
    const mappedFandoms = getMappedItems(
      metadata.fandomList,
      tagMappings.fandom_mapping
    );
    setMappedFandomList(mappedFandoms);
    setSelectedFandom(
      mappedFandoms[metadata.fandomList?.[0]]?.mappedItem ??
        metadata.fandomList?.[0] ??
        ''
    );

    const mappedRelationships = getMappedItems(
      metadata.relationshipList,
      tagMappings.relationship_mapping
    );
    setMappedRelationshipList(mappedRelationships);
    setSelectedRelationship(
      mappedRelationships[metadata?.relationshipList?.[0]]?.mappedItem ??
        metadata.relationshipList?.[0] ??
        ''
    );

    const mappedCharacters = getMappedItems(
      metadata.characterList,
      tagMappings.character_mapping
    );
    setMappedCharacterList(mappedCharacters);
    setSelectedCharacter(
      mappedCharacters[metadata.characterList?.[0]]?.mappedItem ??
        metadata.characterList?.[0] ??
        ''
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => console.log({ metadata }), [metadata]);

  const fetchChapters = useCallback(async () => {
    setChaptersLoading(true);
    try {
      const chapterResult = await fetch(
        `/db/metadata/chapters?work_url=${encodeURIComponent(metadata.link)}`
      );
      setChapterMetadata(await chapterResult.json());
    } catch (e) {
      console.error(e);
    } finally {
      setChaptersLoading(false);
    }
  }, [metadata.link]);

  const mappingOptions = useMemo(
    () => [
      {
        name: 'fandom',
        variable: selectedFandom,
        variableSetter: setSelectedFandom,
        mappedList: mappedFandomList,
        mappedListSetter: setMappedFandomList,
        metadataKey: 'fandomList',
      },
      {
        name: 'relationship',
        variable: selectedRelationship,
        variableSetter: setSelectedRelationship,
        mappedList: mappedRelationshipList,
        mappedListSetter: setMappedRelationshipList,
        metadataKey: 'relationshipList',
      },
      {
        name: 'main character',
        variable: selectedCharacter,
        variableSetter: setSelectedCharacter,
        mappedList: mappedCharacterList,
        mappedListSetter: setMappedCharacterList,
        metadataKey: 'characterList',
      },
    ],
    [
      mappedCharacterList,
      mappedFandomList,
      mappedRelationshipList,
      selectedCharacter,
      selectedFandom,
      selectedRelationship,
    ]
  );

  // TODO: test that this works. maybe then manually delete data?
  const submitFandom = useCallback(async () => {
    setSubmittingFandom(true);

    await createUpdateFandom({
      fandom_name: selectedFandom,
      category_id: categoryId,
      category_name: categoryName,
    });
    setSubmittingFandom(false);
    await mutate('/db/fandoms');
  }, [categoryId, categoryName, selectedFandom]);

  // TODO: option to remove any of these items?
  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      {metadata.title !== null && (
        <RemovableItem
          removeCallback={() =>
            setMetadata((prev) => ({ ...prev, title: null }))
          }
        >
          <TextField
            size='small'
            label='Title'
            value={metadata.title ?? ''}
            onChange={(e) =>
              setMetadata((prev) => ({ ...prev, title: e.target.value }))
            }
          />
        </RemovableItem>
      )}

      {/* TODO: mega mapping. you know what I mean. */}
      {mappingOptions.map((option, index) => (
        <RemovableItem
          key={`${option.name}-${index}`}
          removeCallback={() => {
            if (option.name === 'fandom')
              setMetadata((prev) => ({ ...prev, fandom_id: null }));
            else if (option.name === 'relationship')
              setMetadata((prev) => ({ ...prev, relationship: null }));
            else if (option.name === 'main characeter')
              setMetadata((prev) => ({ ...prev, main_character: null }));
          }}
        >
          <Typography variant='body1'>
            {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
          </Typography>
          <RadioGroup
            name={`${option.name}-select`}
            value={option.variable ?? metadata[option.metadataKey]?.[0]}
            onChange={(e) => option.variableSetter(e.target.value)}
          >
            {metadata[option.metadataKey]?.map((item, i) => {
              const mapping = option.mappedList[item];

              if (!mapping) return <></>;

              return (
                <div
                  key={mapping.mappedItem ?? item}
                  className={styles.flexRow}
                  style={{ alignItems: 'center' }}
                >
                  <FormControlLabel
                    key={`${option.name}-${i}`}
                    label={mapping.mappedItem ?? item}
                    value={mapping.mappedItem ?? item}
                    control={<Radio />}
                  />
                  {mapping.manuallyMapped && (
                    <>
                      <Typography variant='body1'>maps to:</Typography>
                      <TextField
                        size='small'
                        label={`Mapped ${option.name} name`}
                        value={option.mappedList[item].mappedItem}
                        onChange={(e) =>
                          // option.mappedListSetter((prev) => ({
                          //   ...prev,
                          //   [item]: {
                          //     mappedItem: e.target.value,
                          //     manuallyMapped: true,
                          //   },
                          // }))
                          setLocalTagMappings((prev) => ({
                            ...prev,
                            [`${option.name}_mapping`]: {
                              ...prev[`${option.name}_mapping`],
                              [item]: {
                                mappedItem: e.target.value,
                                manuallyMapped: true,
                              },
                            },
                          }))
                        }
                      />
                    </>
                  )}
                </div>
              );
            })}
          </RadioGroup>
          {/* TODO: this should be its own component tbh */}
          {option.name === 'fandom' &&
            !!selectedFandom &&
            !selectedFandomId && (
              <div className={styles.flexColumn}>
                <TextField
                  select
                  size='small'
                  sx={{
                    width: '100px',
                  }}
                  label='Category'
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {categories.map((category, i) => (
                    <MenuItem key={i} value={category.fandom_category_id}>
                      {category.category_name}
                    </MenuItem>
                  ))}
                  {categoriesLoading && (
                    <MenuItem disabled value={0}>
                      Loading...
                    </MenuItem>
                  )}
                </TextField>
                {isNewCategory ? (
                  <TextField
                    size='small'
                    label='Category Name'
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                ) : (
                  <Button
                    onClick={() => setIsNewCategory(true)}
                    startIcon={<Add />}
                  >
                    New Category
                  </Button>
                )}
                <Button onClick={submitFandom}>
                  {submittingFandom ? <CircularProgress /> : <Check />}
                </Button>
              </div>
            )}
        </RemovableItem>
      ))}

      {/* TODO: colors? just letters? look at stats mapping & generalize? */}
      <RemovableItem
        removeCallback={() =>
          setMetadata((prev) => ({ ...prev, rating: null }))
        }
      >
        <TextField
          size='small'
          select
          label='Rating'
          value={metadata.rating}
          onChange={(e) =>
            setMetadata((prev) => ({
              ...prev,
              rating: e.target.value as Rating,
            }))
          }
        >
          {Object.values(Rating).map((rating) => (
            <MenuItem key={rating} value={rating}>
              <span>{rating}</span>
            </MenuItem>
          ))}
        </TextField>
      </RemovableItem>

      {/* TODO: this should be a radio too prob */}
      <RemovableItem
        removeCallback={() =>
          setMetadata((prev) => ({ ...prev, category: null }))
        }
      >
        <TextField
          size='small'
          select
          label='Category'
          value={metadata.category}
          onChange={(e) =>
            setMetadata((prev) => ({ ...prev, category: e.target.value }))
          }
        >
          {Object.values(Category).map((category) => (
            <MenuItem key={category} value={category}>
              <span>{category}</span>
            </MenuItem>
          ))}
        </TextField>
      </RemovableItem>

      <RemovableItem
        removeCallback={() =>
          setMetadata((prev) => ({ ...prev, wordcount: null }))
        }
      >
        <TextField
          size='small'
          label='Wordcount'
          value={metadata.wordcount?.toString()}
          onChange={(e) =>
            setMetadata((prev) => ({
              ...prev,
              wordcount: parseInt(e.target.value),
            }))
          }
        />
      </RemovableItem>

      <br />

      {metadata.chaptered && (
        <LoadingButton
          variant='contained'
          loading={chaptersLoading}
          onClick={fetchChapters}
        >
          Fetch chapters
        </LoadingButton>
      )}

      {chapterMetadata.map((chapter, i) => (
        <Fragment key={`chapter-$`}>
          <Typography variant='body1'>{chapter.chapter_number}</Typography>
          <TextField
            size='small'
            label='Chapter Title'
            value={chapter.chapter_title}
            onChange={(e) =>
              setChapterMetadata((prev) =>
                prev.map((val, index) =>
                  index === i ? { ...val, chapter_title: e.target.value } : val
                )
              )
            }
          />
        </Fragment>
      ))}
    </div>
  );
}
