import { SectionType } from '@/app/types';
import { TextField, Typography } from '@mui/material';
import { useMemo } from 'react';
import styles from '@/app/forms/forms.module.css';

interface SectionFormProps {
  sectionType: SectionType;
  section: Partial<Section>;
  setSection: (section: Partial<Section>) => void;
  chapters?: any[];
}

export default function SectionForm({
  sectionType,
  section,
  setSection,
  chapters,
}: SectionFormProps) {
  const baseSectionInfo = useMemo(() => {
    return (
      <>
        <Typography>{section.number}</Typography>
        <TextField
          size='small'
          value={section.title ?? ''}
          onChange={(e) => setSection({ ...section, title: e.target.value })}
          required
          label='Title'
        />
        <TextField
          size='small'
          value={section.wordcount ?? null}
          onChange={(e) =>
            setSection({
              ...section,
              wordcount: parseInt(e.target.value),
            })
          }
          required
          label='Wordcount'
        />
        <TextField
          size='small'
          value={section.text_link ?? ''}
          onChange={(e) =>
            setSection({ ...section, text_link: e.target.value })
          }
          label='Doc/Text link'
        />
      </>
    );
  }, [section, setSection]);

  switch (sectionType) {
    case SectionType.SINGLE_TO_MULTIPLE:
      return (
        <div className={styles.flexRow} style={{ width: 'fit-content ' }}>
          {baseSectionInfo}
        </div>
      );
    case SectionType.CHAPTERS_SPLIT:
      return (
        <div className={styles.flexRow} style={{ width: 'fit-content' }}>
          {baseSectionInfo}
        </div>
      );
    // chapters_combine should have a dropdown selection of the chapters
    // but we're not supporting it yet because of the difficulties
    case SectionType.DEFAULT:
    default:
      return <></>;
  }
}
