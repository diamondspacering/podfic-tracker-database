import { deletePodfic } from '@/app/lib/updaters';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

export default function DeletePodficDialog({
  isOpen,
  onClose,
  submitCallback,
  podficTitle,
  podficId,
  workId,
}: {
  isOpen: boolean;
  onClose: () => void;
  submitCallback: () => Promise<void>;
  podficTitle: string;
  podficId: number;
  workId?: number;
}) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        Are you sure you want to delete this podfic and all related resources?
      </DialogTitle>
      <DialogContent>Title: {podficTitle}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {/* TODO: loading/disabled state */}
        <Button
          variant='contained'
          style={{ backgroundColor: 'red' }}
          onClick={async () => {
            await deletePodfic(podficId, workId);
            await submitCallback();
            onClose();
          }}
        >
          Yes, permanently delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
