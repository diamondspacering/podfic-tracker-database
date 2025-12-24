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
  sectionId?: number;
  file?: File;
}

export default function FileDialog({
  isOpen,
  onClose,
  submitCallback,
  existingLength,
  podficId,
  podficTitle,
  sectionId,
  file: fileProp,
}: FileDialogProps) {
  const [file, setFile] = useState(fileProp ?? getDefaultFile(existingLength));

  useEffect(
    () => setFile(fileProp ?? getDefaultFile(existingLength)),
    [existingLength, fileProp]
  );

  const submitFile = useCallback(async () => {
    // returns id, currently not being used
    await createUpdateFile({
      file_id: file.file_id,
      podficId,
      sectionId,
      length: file.length,
      label: file.label,
      size: file.size,
      filetype: file.filetype,
      isPlain: file.is_plain,
      links: file.links,
    });
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
    sectionId,
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
          sectionId={sectionId}
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
