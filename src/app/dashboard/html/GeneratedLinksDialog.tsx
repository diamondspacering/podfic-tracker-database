import styles from '@/app/dashboard/dashboard.module.css';
import ExternalLink from '@/app/ui/ExternalLink';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from '@mui/material';

export default function GeneratedLinksDialog({
  isOpen,
  onClose,
  files,
  setFiles,
  submitCallback,
}) {
  // TODO: perhaps it should keep its own state?
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Review Generated Files</DialogTitle>
      <DialogContent>
        <br /> <br />
        <div
          className={styles.flexColumn}
          style={{
            maxHeight: '500px',
            overflowY: 'scroll',
          }}
        >
          <br /> <br />
          {files.map((fileLink, index) => {
            const linkText = fileLink?.link.split(
              'https://podfic.jinjurly.com/audfiles2/'
            )?.[1];
            return (
              <div
                key={index}
                className={styles.flexColumn}
                style={{
                  maxWidth: '70%',
                }}
              >
                <TextField
                  size='small'
                  label='Link'
                  value={linkText}
                  onChange={(e) =>
                    setFiles((prev) =>
                      prev.map((f, i) =>
                        index === i
                          ? {
                              ...f,
                              link: `https://podfic.jinjurly.com/audfiles2/${e.target.value}`,
                            }
                          : f
                      )
                    )
                  }
                />
                <ExternalLink href={fileLink.link} />
                <audio src={fileLink.link} controls preload='metadata'></audio>
                <br />
                <br />
              </div>
            );
          })}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitCallback}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
