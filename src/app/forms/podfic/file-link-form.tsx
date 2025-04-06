import { hosts } from '@/app/lib/data';
import {
  formatDateString,
  generateAADate,
  generateAALink,
  transformDropboxLink,
} from '@/app/lib/format';
import {
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import styles from '@/app/forms/forms.module.css';

export default function FileLinkForm({ link, setLink, podficTitle, label }) {
  const [aaDate, setAADate] = useState(formatDateString(new Date()));

  // DO NOT add other dependencies or it will maximum update depth exceeded. TODO: work on that I guess
  useEffect(() => {
    if (link.host === 'audiofic archive') {
      const dateString = generateAADate(aaDate);
      const fileString = generateAALink({
        title: podficTitle,
        date: dateString,
        label,
      });
      setLink({ ...link, link: fileString });
    }
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
              newLink.includes(host.toLowerCase()) ||
              (host === 'audiofic archive' && newLink.includes('jinjurly')) ||
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
          <a href={link.link} target='_blank'>
            {link.link}
          </a>
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
          {/* TODO: this should have nicknames as well? save that for podfic...? */}
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
