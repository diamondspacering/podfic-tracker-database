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
  // setChapter: React.Dispatch<React.SetStateAction<Chapter>> | null;
  setChapter: (val: Chapter) => void | null;
  idCallback?: (val: number) => void;
  fullEdit?: boolean;
}

// determine whether to make request based on oh yeah it should be based on podfic id haha
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
  const [length, setLength] = useState(chapter.length ?? getDefaultLength());
  // const [status, setStatus] = useState(chapter.status ?? null);

  const [submitting, setSubmitting] = useState(false);

  // TODO: does not load things in properly haha
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
      length: length,
    };
    // TODO: error state
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
    length,
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
            // TODO: may not need this label
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
          {fullEdit && (
            <>
              <DurationPicker
                value={length}
                onChange={(val) => setLength(val)}
              />
              {/* <StatusSelect
                value={chapter.status}
                setValue={(val) => setChapter((prev) => ({ ...prev, status: val as PodficStatus }))}
                type='podfic'
              /> */}
            </>
          )}
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
