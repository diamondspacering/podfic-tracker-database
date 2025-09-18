import {
  TagMappings,
  useAuthors,
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
import {
  createUpdateAuthorClient,
  createUpdateFandom,
} from '@/app/lib/updaters';
import { Category, PermissionStatus, Rating } from '@/app/types';
import { LoadingButton } from '@mui/lab';
import { socialMedia } from '@/app/lib/dataGeneral';
import StatusBadge from '@/app/ui/StatusBadge';

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
  setLocalTagMappings,
}: MetadataFormProps) {
  // oh but these boys.....they are wrecking my mega mapping...curses on all variables
  const { fandoms } = useFandoms();
  const { categories, isLoading: categoriesLoading } = useFandomCategories();
  const { authors } = useAuthors();

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
  const [newAuthorData, setNewAuthorData] = useState<any>({});
  const [submittingAuthor, setSubmittingAuthor] = useState(false);

  const [chaptersLoading, setChaptersLoading] = useState(false);

  const selectedFandomId = useMemo(
    () =>
      fandoms.find((fandom) => fandom.fandom_name === selectedFandom)
        ?.fandom_id ?? '',
    [fandoms, selectedFandom]
  );

  const selectedAuthorId = useMemo(
    () =>
      authors.find((author) => author.username === metadata.authorsString)
        ?.author_id ?? '',
    [authors, metadata.authorsString]
  );

  useEffect(() => {
    if (selectedFandomId) {
      setMetadata((prev) => ({ ...prev, fandom_id: selectedFandomId }));
    }
  }, [selectedFandomId, setMetadata]);

  useEffect(() => {
    if (selectedAuthorId) {
      setMetadata((prev) => ({ ...prev, author_id: selectedAuthorId }));
    }
  }, [selectedAuthorId, setMetadata]);

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

  const fetchChapters = useCallback(async () => {
    setChaptersLoading(true);
    try {
      const chapterResult = await fetch(
        `/db/metadata/chapters?work_url=${encodeURIComponent(metadata.link)}`
      );
      const chapters = await chapterResult.json();
      setMetadata((prev) => ({ ...prev, chapters }));
    } catch (e) {
      console.error(e);
    } finally {
      setChaptersLoading(false);
    }
  }, [metadata.link, setMetadata]);

  const mappingOptions = useMemo(
    () => [
      {
        name: 'fandom',
        variable: selectedFandom,
        variableSetter: setSelectedFandom,
        mappedList: mappedFandomList,
        mappedListSetter: setMappedFandomList,
        metadataListKey: 'fandomList',
        metadataKey: 'fandom_id',
      },
      {
        name: 'relationship',
        variable: selectedRelationship,
        variableSetter: setSelectedRelationship,
        mappedList: mappedRelationshipList,
        mappedListSetter: setMappedRelationshipList,
        metadataListKey: 'relationshipList',
        metadataKey: 'relationship',
      },
      {
        name: 'main character',
        variable: selectedCharacter,
        variableSetter: setSelectedCharacter,
        mappedList: mappedCharacterList,
        mappedListSetter: setMappedCharacterList,
        metadataListKey: 'characterList',
        metadataKey: 'main_character',
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

  const submitAuthor = useCallback(async () => {
    setSubmittingAuthor(true);

    await createUpdateAuthorClient({
      ...newAuthorData,
      username: metadata.authorsString,
      ao3: metadata.authorsLink,
    });
    setSubmittingAuthor(false);
    await mutate('/db/authors');
  }, [metadata.authorsLink, metadata.authorsString, newAuthorData]);

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

      {metadata.authorsString !== null && (
        <RemovableItem
          removeCallback={() =>
            setMetadata((prev) => ({
              ...prev,
              authorsString: null,
              author_id: null,
            }))
          }
        >
          <TextField
            size='small'
            label='Author(s)'
            value={metadata.authorsString ?? ''}
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                authorsString: e.target.value,
              }))
            }
          />
          {!selectedAuthorId && (
            <div className={styles.flexRow}>
              <TextField
                size='small'
                sx={{
                  width: '30px',
                }}
                label='Link'
                value={metadata.authorsLink}
                onChange={(e) =>
                  setMetadata((prev) => ({
                    ...prev,
                    authorsLink: e.target.value,
                  }))
                }
              />
              <TextField
                select
                size='small'
                sx={{
                  width: '100px',
                }}
                label='Primary Social Media'
                value={newAuthorData.primary_social_media}
                onChange={(e) =>
                  setNewAuthorData((prev) => ({
                    ...prev,
                    primary_social_media: e.target.value,
                  }))
                }
              >
                {socialMedia.map((sm) => (
                  <MenuItem key={sm} value={sm}>
                    {sm}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size='small'
                sx={{
                  width: '175px',
                }}
                label='Permission Status'
                value={newAuthorData.permission_status}
                onChange={(e) =>
                  setNewAuthorData((prev) => ({
                    ...prev,
                    permission_status: e.target.value,
                  }))
                }
              >
                {Object.values(PermissionStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    <StatusBadge status={status} />
                  </MenuItem>
                ))}
              </TextField>
              <Button onClick={submitAuthor}>
                {submittingAuthor ? <CircularProgress /> : <Check />}
              </Button>
            </div>
          )}
        </RemovableItem>
      )}

      {mappingOptions.map((option, index) => {
        return metadata[option.metadataKey] !== null ? (
          <RemovableItem
            key={`${option.name}-${index}`}
            removeCallback={() => {
              if (option.name === 'fandom')
                setMetadata((prev) => ({ ...prev, fandom_id: null }));
              else if (option.name === 'relationship')
                setMetadata((prev) => ({ ...prev, relationship: null }));
              else if (option.name === 'main character')
                setMetadata((prev) => ({ ...prev, main_character: null }));
            }}
          >
            <Typography variant='body1'>
              {option.name.charAt(0).toUpperCase() + option.name.slice(1)}
            </Typography>
            <RadioGroup
              name={`${option.name}-select`}
              value={option.variable ?? metadata[option.metadataListKey]?.[0]}
              onChange={(e) => option.variableSetter(e.target.value)}
            >
              {metadata[option.metadataListKey]?.map((item, i) => {
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
                            setLocalTagMappings((prev) => ({
                              ...prev,
                              [`${
                                option.name === 'main character'
                                  ? 'character'
                                  : option.name
                              }_mapping`]: {
                                ...prev[
                                  `${
                                    option.name === 'main character'
                                      ? 'character'
                                      : option.name
                                  }_mapping`
                                ],
                                [item]: e.target.value,
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
            {option.name === 'fandom' &&
              !!selectedFandom &&
              !selectedFandomId && (
                <div className={styles.flexRow}>
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
        ) : (
          <></>
        );
      })}

      {/* TODO: colors? just letters? look at stats mapping & generalize? */}
      {metadata.rating !== null && (
        <RemovableItem
          removeCallback={() =>
            setMetadata((prev) => ({ ...prev, rating: null }))
          }
        >
          <TextField
            size='small'
            sx={{
              width: '100px',
            }}
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
      )}

      {/* TODO: this should be a radio too prob */}
      {metadata.category !== null && (
        <RemovableItem
          removeCallback={() =>
            setMetadata((prev) => ({ ...prev, category: null }))
          }
        >
          <RadioGroup
            name='category'
            value={metadata.category}
            onChange={(e) =>
              setMetadata((prev) => ({ ...prev, category: e.target.value }))
            }
          >
            {Object.values(Category).map((category) => (
              <FormControlLabel
                label={category}
                key={category}
                value={category}
                control={<Radio />}
              />
            ))}
          </RadioGroup>
        </RemovableItem>
      )}

      {metadata.wordcount !== null && (
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
      )}

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

      {metadata.chapters?.map((chapter, i) => (
        <Fragment key={`chapter-${i}`}>
          <Typography variant='body1'>{chapter.chapter_number}</Typography>
          <TextField
            size='small'
            label='Chapter Title'
            value={chapter.chapter_title}
            onChange={(e) =>
              setMetadata((prev) => ({
                ...prev,
                chapters: prev.chapters.map((val, index) =>
                  index === i ? { ...val, chapter_title: e.target.value } : val
                ),
              }))
            }
          />
        </Fragment>
      ))}
    </div>
  );
}
