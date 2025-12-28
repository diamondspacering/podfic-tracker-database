import { hosts } from '@/app/lib/dataGeneral';
import {
  formatDateString,
  generateAADate,
  transformDropboxLink,
} from '@/app/lib/format';
import { generateAALink } from '@/app/lib/html';
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '@/app/forms/forms.module.css';
import ExternalLink from '@/app/ui/ExternalLink';

export default function FileLinkForm({
  link,
  setLink,
  podficTitle,
  sectionType,
  section,
  sectionId,
  chaptered,
  label,
}) {
  const [aaDate, setAADate] = useState(formatDateString(new Date()));
  // TODO: hmmm section info w/ embedded chapter?
  const [chapter, setChapter] = useState({} as Chapter);

  useEffect(() => {
    if (link.host === 'audiofic archive') {
      const dateString = generateAADate(aaDate);
      // TODO: make this work correctly
      const fileString = generateAALink({
        title: podficTitle,
        chapterInfo: chapter,
        date: dateString,
        label,
        sectionType,
        chaptered,
        section,
      });
      setLink({ ...link, link: fileString });
    }
    // if other dependencies are added, it will maximum update depth exceeded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [link.host, aaDate]);

  return (
    <div className={styles.flexColumn}>
      <TextField
        size='small'
        label='Link'
        sx={{
          width: '500px',
        }}
        value={link.link ?? ''}
        onChange={(e) => {
          const newLink = e.target.value ?? '';
          let linkHost = link.host;
          hosts.forEach((host) => {
            if (
              (newLink.includes(host.toLowerCase()) &&
                !(host.toLowerCase() === 'archive.org') &&
                newLink.includes('audioficarchive')) ||
              (host === 'audiofic archive' &&
                newLink.includes('audioficarchive')) ||
              (host === 'archive.org' && newLink.includes('archive'))
            ) {
              linkHost = host;
              return;
            }
          });
          // setLink((prev) => ({ ...prev, link: newLink, host: linkHost }));
          console.log(`new values: ${newLink}, ${linkHost}`);
          setLink({ ...link, link: newLink, host: linkHost });
        }}
      />
      {link.link?.includes('www.dropbox.com') && (
        <Button
          onClick={() =>
            setLink({
              ...link,
              link: transformDropboxLink(link.link),
            })
          }
        >
          Transform Dropbox link?
        </Button>
      )}
      {!!link.link && (
        <>
          <ExternalLink href={link.link} />
          <audio src={link.link} controls preload='metadata'></audio>
        </>
      )}
      <TextField
        select
        size='small'
        sx={{
          width: '200px',
        }}
        label='Host'
        value={link.host ?? ''}
        onChange={(e) => setLink({ ...link, host: e.target.value })}
      >
        {hosts.map((host) => (
          <MenuItem key={host} value={host}>
            {host}
          </MenuItem>
        ))}
      </TextField>
      {link.host === 'audiofic archive' && (
        <>
          <span>
            Change date:
            <TextField
              size='small'
              type='date'
              value={aaDate}
              onChange={(e) => setAADate(e.target.value)}
            />
          </span>
        </>
      )}
      <FormControlLabel
        label='Is direct'
        control={
          <Checkbox
            checked={link.is_direct ?? true}
            onChange={(e) => setLink({ ...link, is_direct: e.target.checked })}
          />
        }
      />
      <FormControlLabel
        label='Is embed'
        control={
          <Checkbox
            checked={link.is_embed ?? false}
            onChange={(e) => setLink({ ...link, is_embed: e.target.checked })}
          />
        }
      />
    </div>
  );
}
