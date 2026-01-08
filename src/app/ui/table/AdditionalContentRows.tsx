import { useCallback, useMemo, useState } from 'react';
import NoteDialog from '../note/note-dialog';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { Delete, Edit, OpenInNew } from '@mui/icons-material';
import ResourceDialog from '../resource/resource-dialog';
import ExternalLink from '../ExternalLink';
import PermissionAskDialog from '../permission-ask/permission-ask-dialog';
import CustomTable from './CustomTable';
import { createColumnHelper } from '@tanstack/react-table';
import { TableCell } from './TableCell';
import { socialMedia } from '@/app/lib/dataGeneral';
import { StatusType } from '@/app/types';
import { formatTableDate } from '@/app/lib/utils';
import { EditCell } from './EditCell';
import { createUpdatePermissionAsk } from '@/app/lib/updaters';
import tableStyles from '@/app/ui/table/table.module.css';
import CoverArtDialog from '../cover-art/cover-art-dialog';

interface AdditionalContentRowsProps {
  coverArt?: CoverArt;
  notes?: Note[];
  resources?: Resource[];
  permissionAsks?: Permission[];
  width: number;
  author_id?: number;
  podfic_id?: number;
  work_id?: number;
  chapter_id?: number;
  event_id?: number;
  submitCallback?: () => Promise<void>;
}

export default function AdditionalContentRows({
  coverArt,
  notes,
  resources,
  permissionAsks,
  width,
  author_id,
  podfic_id,
  work_id,
  chapter_id,
  event_id,
  submitCallback,
}: AdditionalContentRowsProps) {
  const [coverArtDialogOpen, setCoverArtDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [permissionAskDialogOpen, setPermissionAskDialogOpen] = useState(false);

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const [selectedPermissionAsk, setSelectedPermissionAsk] =
    useState<Permission | null>(null);

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

  const columnHelper = createColumnHelper<Permission>();

  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const permissionColumns = useMemo(
    () => [
      columnHelper.accessor('permission_id', {
        header: 'ID',
        cell: TableCell,
        meta: {
          type: 'number',
          immutable: true,
        },
      }),
      columnHelper.accessor('work_id', {
        header: 'Work ID',
        cell: TableCell,
        meta: {
          type: 'number',
          immutable: true,
        },
      }),
      columnHelper.accessor('author_id', {
        header: 'Author ID',
        cell: TableCell,
        meta: {
          type: 'number',
          immutable: true,
        },
      }),
      columnHelper.accessor('ask_link', {
        header: 'Ask',
        cell: TableCell,
        meta: {
          type: 'link',
        },
      }),
      columnHelper.accessor('ask_medium', {
        header: 'Medium',
        cell: TableCell,
        meta: {
          type: 'select',
          label: 'Medium',
          width: '130px',
          options: socialMedia.map((sm) => ({ label: sm, value: sm })),
        },
      }),
      columnHelper.accessor('asked_date', {
        header: 'Asked Date',
        cell: ({ getValue, ...rest }) => (
          <TableCell
            getValue={() =>
              formatTableDate(getValue(), editingRowId === rest.row.id)
            }
            {...rest}
          />
        ),
        meta: {
          type: 'date',
        },
      }),
      columnHelper.accessor('response_date', {
        header: 'Response Date',
        cell: ({ getValue, ...rest }) => (
          <TableCell
            getValue={() =>
              formatTableDate(getValue(), editingRowId === rest.row.id)
            }
            {...rest}
          />
        ),
        meta: {
          type: 'date',
        },
      }),
      columnHelper.accessor('permission_status', {
        header: 'Status',
        cell: TableCell,
        meta: {
          type: 'status',
          statusType: StatusType.PERMISSION_ASK,
        },
      }),
      columnHelper.display({
        id: 'edit',
        cell: EditCell,
      }),
      columnHelper.display({
        id: 'dialog-edit',
        cell: (props) => (
          <IconButton
            style={{ padding: '0px' }}
            onClick={() => {
              setSelectedPermissionAsk(props.row.original);
              setPermissionAskDialogOpen(true);
            }}
          >
            <OpenInNew />
          </IconButton>
        ),
      }),
    ],
    [columnHelper, editingRowId]
  );

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
      <CoverArtDialog
        isOpen={coverArtDialogOpen}
        onClose={() => {
          setCoverArtDialogOpen(false);
        }}
        submitCallback={async () => {
          setCoverArtDialogOpen(false);
          await submitCallback?.();
        }}
        podfic_id={podfic_id}
        item={coverArt}
      />
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
        section_id={chapter_id}
        event_id={event_id}
        item={selectedNote}
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
        event_id={event_id}
        item={selectedResource}
      />
      <PermissionAskDialog
        isOpen={permissionAskDialogOpen}
        onClose={() => {
          setPermissionAskDialogOpen(false);
          setSelectedPermissionAsk({} as Permission);
        }}
        submitCallback={async () => {
          setPermissionAskDialogOpen(false);
          setSelectedPermissionAsk({} as Permission);
          await submitCallback?.();
        }}
        authorId={author_id}
        workId={work_id}
        item={selectedPermissionAsk}
      />
      {!!coverArt && (
        <tr key={`cover-art-${coverArt.cover_art_id}`}>
          <td colSpan={width} style={{ paddingLeft: '30px' }}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Cover artist</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span
                      style={{
                        display: 'block',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        maxWidth: '100px',
                      }}
                    >
                      <ExternalLink href={coverArt.image_link} />
                    </span>
                  </td>
                  <td>{coverArt.cover_artist_name}</td>
                  <td>{coverArt.cover_art_status}</td>
                  <td>
                    <IconButton
                      style={{ padding: '0px', paddingLeft: '5px' }}
                      onClick={() => {
                        setCoverArtDialogOpen(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      )}
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
      {/* TODO: actually really not a fan of how this displays - should be smaller */}
      {permissionAsks?.length > 0 && (
        <tr key='permission'>
          <td colSpan={width} style={{ paddingLeft: '30px' }}>
            <CustomTable
              isLoading={false}
              data={permissionAsks}
              columns={permissionColumns}
              rowKey='permission_id'
              rowCanExpand={false}
              showRowCount={false}
              editingRowId={editingRowId}
              setEditingRowId={setEditingRowId}
              columnVisibility={{
                permission_id: false,
                work_id: false,
                author_id: false,
              }}
              updateItemInline={async (editingRow) => {
                await createUpdatePermissionAsk(editingRow);
              }}
            />
          </td>
        </tr>
      )}
    </>
  );
}
