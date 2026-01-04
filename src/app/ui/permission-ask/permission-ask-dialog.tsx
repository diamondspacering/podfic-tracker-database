import { createUpdatePermissionAsk } from '@/app/lib/updaters';
import { DialogProps } from '@/app/types';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import PermissionAskForm from './permission-ask-form';

interface PermissionAskDialogProps extends DialogProps<Permission> {
  authorId: number;
  workId?: number;
}

export default function PermissionAskDialog({
  isOpen,
  onClose,
  submitCallback,
  authorId,
  workId,
  item: permissionProp,
}: PermissionAskDialogProps) {
  const [permissionAsk, setPermissionAsk] = useState<Permission>(
    permissionProp ?? ({ author_id: authorId, work_id: workId } as Permission)
  );

  useEffect(
    () =>
      setPermissionAsk(
        permissionProp ??
          ({ author_id: authorId, work_id: workId } as Permission)
      ),
    [authorId, permissionProp, workId]
  );

  const submitPermissionAsk = useCallback(async () => {
    try {
      await createUpdatePermissionAsk(permissionAsk);
      submitCallback?.();
    } catch (e) {
      console.error('Error submitting permission ask', e);
    }
  }, [permissionAsk, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      disableRestoreFocus
    >
      <DialogTitle>
        {!!permissionProp ? 'Edit Permission Ask' : 'New Permission Ask'}
      </DialogTitle>
      <DialogContent>
        <PermissionAskForm
          permissionAsk={permissionAsk}
          setPermissionAsk={setPermissionAsk}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitPermissionAsk}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
