import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import FileForm from './file-form';
import { useCallback, useEffect, useState } from 'react';
import { createUpdateFile } from '@/app/lib/updaters';
import { FileType, getDefaultFile, getDefaultLength } from '@/app/types';

interface FileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submitCallback: () => void;
  existingLength?: Length;
  podficId?: number;
  podficTitle?: string;
  chapterId?: number;
  file?: File;
}

export default function FileDialog({
  isOpen,
  onClose,
  submitCallback,
  existingLength,
  podficId,
  podficTitle,
  chapterId,
  file: fileProp,
}: FileDialogProps) {
  const [file, setFile] = useState(fileProp ?? getDefaultFile(existingLength));

  useEffect(
    () => setFile(fileProp ?? getDefaultFile(existingLength)),
    [fileProp]
  );

  const submitFile = useCallback(async () => {
    const _id = await createUpdateFile({
      file_id: file.file_id,
      podficId,
      chapterId,
      length: file.length,
      label: file.label,
      size: file.size,
      filetype: file.filetype,
      isPlain: file.is_plain,
      links: file.links,
    });
    // TODO: any callbacks
    submitCallback?.();
    setFile({
      label: '',
      size: null,
      length: existingLength ?? getDefaultLength(),
      filetype: FileType.MP3,
    } as File);
  }, [
    file.file_id,
    file.length,
    file.label,
    file.size,
    file.filetype,
    file.is_plain,
    file.links,
    podficId,
    chapterId,
    submitCallback,
    existingLength,
  ]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle>New File</DialogTitle>
      <DialogContent>
        <FileForm
          file={file}
          setFile={setFile}
          podficTitle={podficTitle}
          chapterId={chapterId}
          existingLength={existingLength}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' onClick={submitFile}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
