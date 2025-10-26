import { Check, Close, Edit } from '@mui/icons-material';
import { Button } from '@mui/material';

export const EditCell = ({ row, table }) => {
  const meta = table.options.meta as any;
  const isEditing = meta?.editingRowId === row.id;
  const isDisabled = !!meta?.editingRowId && meta?.editingRowId !== row.id;

  return (
    <div>
      {isEditing ? (
        <span>
          <Button
            onClick={() => {
              meta?.setEditingRowId(null);
              meta?.setEditingRow(null);
              meta?.revertRow(row.id);
            }}
            sx={{
              padding: '0px',
            }}
          >
            <Close />
          </Button>
          <Button
            onClick={async () => {
              await meta?.submitRow(row.id);
              meta?.setEditingRowId(null);
              meta?.setEditingRow(null);
            }}
            sx={{
              padding: '0px',
            }}
          >
            <Check />
          </Button>
        </span>
      ) : (
        <>
          <Button
            disabled={isDisabled}
            onClick={(e) => {
              if (!row.getIsSelected()) e.stopPropagation();
              console.log('editing row', row.original);
              meta?.setEditingRow(row.original);
              meta?.setEditingRowId(row.id);
            }}
            sx={{
              padding: '0px',
            }}
          >
            <Edit />
          </Button>
        </>
      )}
    </div>
  );
};
