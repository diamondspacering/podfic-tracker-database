import { useCallback, useState } from 'react';
import NoteDialog from '../note/note-dialog';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import ResourceDialog from '../resource/resource-dialog';
import ExternalLink from '../ExternalLink';

interface AdditionalContentRowsProps {
  notes?: Note[];
  resources?: Resource[];
  width: number;
  author_id?: number;
  podfic_id?: number;
  chapter_id?: number;
  event_id?: number;
  submitCallback?: () => Promise<void>;
}

export default function AdditionalContentRows({
  notes,
  resources,
  width,
  author_id,
  podfic_id,
  chapter_id,
  event_id,
  submitCallback,
}: AdditionalContentRowsProps) {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );

  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);

  const deleteResource = useCallback(async () => {
    await fetch(
      `/db/resources?resource_id=${selectedResource?.resource_id}&podfic_id=${podfic_id}&author_id=${author_id}&chapter_id=${chapter_id}&event_id=${event_id}`,
      {
        method: 'DELETE',
      }
    );
    await submitCallback?.();
    setDeleteConfirmDialogOpen(false);
  }, [
    author_id,
    chapter_id,
    event_id,
    podfic_id,
    selectedResource?.resource_id,
    submitCallback,
  ]);

  return (
    <>
      <Dialog
        open={deleteConfirmDialogOpen}
        onClose={() => setDeleteConfirmDialogOpen(false)}
      >
        <DialogTitle>
          Are you sure you want to delete this resource?
        </DialogTitle>
        <DialogContent>
          <span>
            <b>{`${selectedResource?.resource_type}: `}</b>
            <ExternalLink href={selectedResource?.link}>
              {selectedResource?.label}
            </ExternalLink>
            {selectedResource?.notes ? `, ${selectedResource?.notes}` : ''}
          </span>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={deleteResource}>Delete</Button>
        </DialogActions>
      </Dialog>
      <NoteDialog
        isOpen={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false);
          setSelectedNote({} as Note);
        }}
        submitCallback={async () => {
          setNoteDialogOpen(false);
          setSelectedNote({} as Note);
          await submitCallback?.();
        }}
        author_id={author_id}
        podfic_id={podfic_id}
        chapter_id={chapter_id}
        event_id={event_id}
        note={selectedNote}
      />
      <ResourceDialog
        isOpen={resourceDialogOpen}
        onClose={() => {
          setResourceDialogOpen(false);
          setSelectedResource({} as Resource);
        }}
        submitCallback={async () => {
          setResourceDialogOpen(false);
          setSelectedResource({} as Resource);
          await submitCallback?.();
        }}
        author_id={author_id}
        podfic_id={podfic_id}
        chapter_id={chapter_id}
        event_id={event_id}
        resource={selectedResource}
      />
      {notes?.map((note) => (
        <tr key={`note-${note.note_id}`}>
          <td colSpan={width} style={{ paddingLeft: '30px' }}>
            <span>
              {note.label && <b>{`${note.label}: `}</b>}
              {note.value}
              <IconButton
                style={{ padding: '0px', paddingLeft: '5px' }}
                onClick={() => {
                  setSelectedNote(note);
                  setNoteDialogOpen(true);
                }}
              >
                <Edit />
              </IconButton>
            </span>
          </td>
        </tr>
      ))}
      {resources?.map((resource) => (
        <tr key={`resource-${resource.resource_id}`}>
          <td colSpan={width} style={{ paddingLeft: '30px' }}>
            <span>
              <b>{`${resource.resource_type}: `}</b>
              <ExternalLink href={resource.link}>{resource.label}</ExternalLink>
              {resource.notes ? `, ${resource.notes}` : ''}
              <IconButton
                style={{ padding: '0px', paddingLeft: '5px' }}
                onClick={() => {
                  setSelectedResource(resource);
                  setResourceDialogOpen(true);
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                style={{ padding: '0px', paddingLeft: '5px' }}
                onClick={() => {
                  setSelectedResource(resource);
                  setDeleteConfirmDialogOpen(true);
                }}
              >
                <Delete />
              </IconButton>
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}
