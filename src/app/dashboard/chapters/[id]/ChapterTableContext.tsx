import {
  Dispatch,
  SetStateAction,
  ReactNode,
  useState,
  useCallback,
  createContext,
} from 'react';
import AdditionalContentRows from '@/app/ui/table/AdditionalContentRows';
import { CustomTableProps } from '@/app/ui/table/CustomTable';
import FileTable from '@/app/ui/table/FileTable';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { CellContext, Row } from '@tanstack/react-table';
import ColorScale from 'color-scales';

interface ChapterTableContextType {
  getDefaultTableProps: (columns: any[]) => Partial<CustomTableProps<any>>;
  filesExpanded: boolean;
  setFilesExpanded: Dispatch<SetStateAction<boolean>>;
  expandCellComponent: (props: CellContext<any, any>) => ReactNode;
  editingRowId: string | null;
  setEditingRowId: Dispatch<SetStateAction<string | null>>;
  getExpandedContentCellComponent: (
    lengthColorScale: ColorScale,
    row: Row<any>
  ) => ReactNode;
  podficId: string;
  podficTitle: string;
}

export const ChapterTableContext = createContext<ChapterTableContextType>({
  getDefaultTableProps: () => {
    return {};
  },
  filesExpanded: false,
  setFilesExpanded: () => {},
  expandCellComponent: () => {
    return <></>;
  },
  editingRowId: null,
  setEditingRowId: () => {},
  getExpandedContentCellComponent: () => {
    return <></>;
  },
  podficId: '',
  podficTitle: '',
});

export const useChapterTableContext = ({
  podficId,
  podficTitle,
}): ChapterTableContextType => {
  const [filesExpanded, setFilesExpanded] = useState(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  const getDefaultTableProps = useCallback((): Partial<
    CustomTableProps<any>
  > => {
    return {
      showColumnVisibility: true,
      editingRowId,
      setEditingRowId,
      showRowCount: true,
      rowCanExpand: true,
    };
  }, [editingRowId]);

  const expandCellComponent = (props: CellContext<any, any>) => {
    return (
      <IconButton
        style={{ padding: '0px' }}
        onClick={(e) => {
          e.stopPropagation();
          setFilesExpanded(!props.row.getIsExpanded());
          props.row.toggleExpanded();
        }}
      >
        {props.row.getIsExpanded() ? (
          <KeyboardArrowDown />
        ) : (
          <KeyboardArrowRight />
        )}
      </IconButton>
    );
  };

  const getExpandedContentCellComponent = (
    lengthColorScale: ColorScale,
    row: Row<any>
  ) => {
    return (
      <>
        <tr key='files-expand'>
          <td
            key='1'
            colSpan={row.getAllCells().length}
            style={{
              paddingLeft: '30px',
            }}
          >
            <span>
              <IconButton
                style={{
                  padding: '0px',
                }}
                onClick={() => setFilesExpanded((prev) => !prev)}
              >
                {filesExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
              </IconButton>
              Files
            </span>
          </td>
        </tr>
        {filesExpanded && (
          <tr key='files-expanded'>
            <td
              key='2'
              colSpan={row.getAllCells().length}
              style={{
                paddingLeft: '60px',
              }}
            >
              <FileTable
                podficId={row.getValue('podfic_id')}
                podficTitle={podficTitle}
                sectionId={row.getValue('section_id')}
                lengthColorScale={lengthColorScale}
              />
            </td>
          </tr>
        )}
        <AdditionalContentRows
          width={row.getVisibleCells().length}
          notes={row.original.notes ?? []}
          resources={row.original.resources ?? []}
          podfic_id={row.original.podfic_id}
          chapter_id={row.original.chapter_id}
        />
      </>
    );
  };

  return {
    getDefaultTableProps,
    filesExpanded,
    setFilesExpanded,
    expandCellComponent,
    editingRowId,
    setEditingRowId,
    getExpandedContentCellComponent: getExpandedContentCellComponent,
    podficId,
    podficTitle,
  };
};
