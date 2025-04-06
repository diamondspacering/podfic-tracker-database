'use client';

import { Add } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import FileDialog from '../forms/podfic/file-dialog';
import ResourceDialog from './resource/resource-dialog';
import NoteDialog from './note/note-dialog';
import CoverArtDialog from './cover-art/cover-art-dialog';

interface AddMenuProps {
  podficId?: number;
  podficTitle?: string;
  chapterId?: number;
  authorId?: number;
  eventId?: number;
  length?: Length | null;
  submitCallback?: () => void;
  options?: ('cover_art' | 'file' | 'resource' | 'note' | 'chapter')[];
}

export default function AddMenu({
  podficId,
  chapterId,
  authorId,
  eventId,
  podficTitle,
  length,
  submitCallback,
  options,
}: AddMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [fileFormOpen, setFileFormOpen] = useState(false);
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [coverArtFormOpen, setCoverArtFormOpen] = useState(false);
  const [noteFormOpen, setNoteFormOpen] = useState(false);

  return (
    <>
      <CoverArtDialog
        isOpen={coverArtFormOpen}
        onClose={() => setCoverArtFormOpen(false)}
        submitCallback={() => {
          setCoverArtFormOpen(false);
          submitCallback?.();
        }}
        podfic_id={podficId}
        podficTitle={podficTitle}
      />
      <FileDialog
        isOpen={fileFormOpen}
        onClose={() => setFileFormOpen(false)}
        submitCallback={() => {
          setFileFormOpen(false);
          submitCallback?.();
        }}
        existingLength={length}
        podficId={podficId}
        podficTitle={podficTitle}
        chapterId={chapterId}
      />
      <ResourceDialog
        isOpen={resourceFormOpen}
        onClose={() => setResourceFormOpen(false)}
        submitCallback={() => {
          setResourceFormOpen(false);
          submitCallback?.();
        }}
        podfic_id={podficId}
        chapter_id={chapterId}
        author_id={authorId}
      />
      <NoteDialog
        isOpen={noteFormOpen}
        onClose={() => setNoteFormOpen(false)}
        submitCallback={() => {
          setNoteFormOpen(false);
          submitCallback?.();
        }}
        podfic_id={podficId}
        chapter_id={chapterId}
        author_id={authorId}
        event_id={eventId}
      />
      <div>
        <Button
          variant='contained'
          startIcon={<Add />}
          id='basic-button'
          aria-controls={open ? 'basic-menu' : undefined}
          aria-haspopup='true'
          aria-expanded={open ? 'true' : undefined}
          onClick={handleClick}
          sx={{
            padding: '0px 10px',
            margin: '0px',
          }}
        >
          Add
        </Button>
        <Menu
          id='basic-menu'
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          {options?.includes('cover_art') && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setCoverArtFormOpen(true);
                handleClose();
              }}
            >
              Cover Art
            </MenuItem>
          )}
          {options?.includes('file') && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                if (!podficId && !chapterId) {
                  console.error(
                    'Error: cannot add a file with no podfic or chapter'
                  );
                  return;
                }
                setFileFormOpen(true);
                handleClose();
              }}
            >
              File
            </MenuItem>
          )}
          {options?.includes('resource') && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setResourceFormOpen(true);
                handleClose();
              }}
            >
              Resource
            </MenuItem>
          )}
          {options?.includes('note') && (
            <MenuItem
              onClick={(e) => {
                e.stopPropagation();
                setNoteFormOpen(true);
                handleClose();
              }}
            >
              Note
            </MenuItem>
          )}
        </Menu>
      </div>
    </>
  );
}
