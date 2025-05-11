import styles from '@/app/forms/forms.module.css';
import { usePodficcers } from '@/app/lib/swrLoaders';
import { Autocomplete, Button, TextField } from '@mui/material';

export default function CoverArtForm({ coverArt, setCoverArt }) {
  const { podficcers, isLoading: podficcersLoading } = usePodficcers();

  return (
    <div className={`${styles.flexColumn} ${styles.mt1}`}>
      <Button onClick={() => console.log(coverArt)}>log</Button>
      <Button onClick={() => console.log(podficcers)}>log podficcers</Button>
      <TextField
        size='small'
        label='Cover Artist Name'
        value={coverArt.cover_artist_name ?? ''}
        onChange={(e) =>
          setCoverArt((prev) => ({
            ...prev,
            cover_artist_name: e.target.value,
          }))
        }
      />
      <Autocomplete
        size='small'
        options={podficcers ?? []}
        loading={podficcersLoading}
        getOptionLabel={(option) => option?.username ?? ''}
        sx={{
          width: '200px',
        }}
        value={
          podficcers?.find(
            (podficcer) => podficcer.podficcer_id === coverArt.podficcer_id
          ) ?? { podficcer_id: null, username: '' }
        }
        onChange={(_, newValue) => {
          setCoverArt((prev) => ({
            ...prev,
            podficcer_id: newValue?.podficcer_id ?? null,
            cover_artist_name: newValue?.username ?? '',
          }));
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size='small'
            label='Podficcer&nbsp;&nbsp;&nbsp;'
          />
        )}
      />
      <TextField
        size='small'
        label='Image Link'
        value={coverArt.image_link ?? ''}
        onChange={(e) =>
          setCoverArt((prev) => ({ ...prev, image_link: e.target.value }))
        }
      />
      <TextField
        size='small'
        label='Cover Art Status'
        value={coverArt.cover_art_status ?? ''}
        onChange={(e) =>
          setCoverArt((prev) => ({ ...prev, cover_art_status: e.target.value }))
        }
      />
    </div>
  );
}
