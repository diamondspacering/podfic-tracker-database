import styles from '@/app/forms/forms.module.css';
import { createUpdateChapter } from '@/app/lib/updaters';
import { getDefaultLength } from '@/app/types';
import DurationPicker from '@/app/ui/DurationPicker';
import ExternalLink from '@/app/ui/ExternalLink';
// import StatusBadge from '@/app/ui/StatusBadge';
// import StatusSelect from '@/app/ui/StatusSelect';
import { Check, Edit } from '@mui/icons-material';
import { Button, CircularProgress, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

interface ChapterFormProps {
  chapter: Chapter;
  setChapter: (val: Chapter) => void | null;
  idCallback?: (val: number) => void;
  fullEdit?: boolean;
}

// TODO: how is this being used?
export default function ChapterForm({
  chapter,
  setChapter,
  idCallback,
  fullEdit,
}: ChapterFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [chapterNumber, setChapterNumber] = useState(chapter.chapter_number);
  const [chapterTitle, setChapterTitle] = useState(chapter.chapter_title);
  const [link, setLink] = useState(chapter.link);
  const [wordcount, setWordcount] = useState(chapter.wordcount);
  // const [length, setLength] = useState(chapter.length ?? getDefaultLength());

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!chapter.chapter_id) setIsEditing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitChapter = useCallback(async () => {
    setSubmitting(true);
    const chapterData = {
      ...chapter,
      chapter_number: chapterNumber,
      chapter_title: chapterTitle,
      link: link,
      wordcount: wordcount,
    };
    try {
      if (chapter.podfic_id) {
        if (chapter.chapter_id) {
          console.log(`Updating chapter ${chapter.chapter_id}...`);
          await createUpdateChapter(chapterData);
        } else {
          console.log(
            `Creating new chapter for podfic ${chapter.podfic_id}...`
          );
          const chapter_id = (await createUpdateChapter(chapterData))
            .chapter_id;
          idCallback?.(chapter_id);
        }
      } else {
        setChapter(chapterData);
      }
      setIsEditing(false);
    } catch (e) {
      console.error('Error submitting chapter:', e);
    } finally {
      setSubmitting(false);
    }
  }, [
    chapter,
    chapterNumber,
    chapterTitle,
    link,
    wordcount,
    idCallback,
    setChapter,
  ]);

  return (
    <div className={`${styles.flexRow} ${styles.chapterDiv}`}>
      {isEditing ? (
        <>
          <TextField
            size='small'
            type='number'
            label='Chapter Number'
            value={chapterNumber}
            onChange={(e) => setChapterNumber(parseInt(e.target.value))}
          />
          <TextField
            size='small'
            label='Chapter Title'
            value={chapter.chapter_title}
            onChange={(e) => setChapterTitle(e.target.value)}
          />
          <TextField
            size='small'
            label='Link'
            value={chapter.link}
            onChange={(e) => setLink(e.target.value)}
          />
          <TextField
            size='small'
            label='Wordcount'
            type='number'
            value={chapter.wordcount}
            onChange={(e) => setWordcount(parseInt(e.target.value))}
          />
          {/* {fullEdit && (
            <>
              <DurationPicker
                value={length}
                onChange={(val) => setLength(val)}
              />
            </>
          )} */}
          <Button onClick={submitChapter}>
            {submitting ? <CircularProgress /> : <Check />}
          </Button>
        </>
      ) : (
        <>
          <span>{chapter.chapter_number}</span>
          <span>{chapterTitle}</span>
          <span>
            <ExternalLink href={link}>Link</ExternalLink>
          </span>
          <span>{wordcount} words</span>
          <Button onClick={() => setIsEditing(true)}>
            <Edit />
          </Button>
        </>
      )}
    </div>
  );
}
