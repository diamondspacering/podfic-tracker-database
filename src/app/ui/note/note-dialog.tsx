import { createUpdateNote } from '@/app/lib/updaters';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import NoteForm from './note-form';

interface NoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  submitCallback?: (note: Note) => void;
  noteId?: number;
  note?: Note;
  podfic_id?: number;
  section_id?: number;
  author_id?: number;
  event_id?: number;
}

export default function NoteDialog({
  isOpen,
  onClose,
  submitCallback,
  noteId = null,
  note: noteProp,
  podfic_id = null,
  section_id = null,
  author_id = null,
  event_id = null,
}: NoteDialogProps) {
  const [note, setNote] = useState<Note>(noteProp ? noteProp : ({} as Note));

  useEffect(() => setNote(noteProp ? noteProp : ({} as Note)), [noteProp]);

  const submitNote = useCallback(async () => {
    console.log({ note });
    try {
      const newNote = await createUpdateNote({
        ...note,
        podfic_id,
        section_id,
        author_id,
        event_id,
      });
      setNote({} as Note);
      await submitCallback?.(newNote);
    } catch (e) {
      console.error('Error submitting note:', e);
    }
  }, [author_id, section_id, event_id, note, podfic_id, submitCallback]);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      disableRestoreFocus
    >
      <DialogTitle>
        {noteId || !!noteProp ? 'Edit Note' : 'New Note '}
      </DialogTitle>
      <DialogContent>
        <NoteForm note={note} setNote={setNote} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setNote({} as Note);
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button variant='contained' onClick={submitNote}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
