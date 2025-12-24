'use client';

import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  Mic,
} from '@mui/icons-material';
import { Button, IconButton, Typography } from '@mui/material';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from 'react';
import { CellContext, createColumnHelper, Row } from '@tanstack/react-table';
import { TableCell } from '@/app/ui/table/TableCell';
import { EditCell } from '@/app/ui/table/EditCell';
import AddMenu from '@/app/ui/AddMenu';
import FileTable from '@/app/ui/table/FileTable';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { mutate } from 'swr';
import { useChaptersForPodfic } from '@/app/lib/swrLoaders';
import AdditionalContentRows from '@/app/ui/table/AdditionalContentRows';
import {
  formatTableDate,
  useColorScale,
  useLengthColorScale,
} from '@/app/lib/utils';
import CustomTable, { CustomTableProps } from '@/app/ui/table/CustomTable';
import { SectionType } from '@/app/types';
import ChapterOnlyTable from './ChapterOnlyTable';
import ColorScale from 'color-scales';
import ChapterWithSubSectionsTable from './ChapterWithSubSectionsTable';

// ok so if default or multiple-to-single just show chapters
// single-to-multiple not applicable
// if chapters-split then show sections under chapter headers?
// if chapters-combine then show chapters included in sections under section headers
// maybe have a bolded thing, possibly w/ combined stats, and then chapters/sections under each? with stats? this. maay be difficult to put together w/ the current table methods. haha.
// and then whichever is the section needs the HTML but the chapter doesn't
// but whatever is nested needs the recording button

// html cell? add related cell?
interface ChapterTableContextType {
  getDefaultTableProps: (columns: any[]) => Partial<CustomTableProps<any>>;
  filesExpanded: boolean;
  setFilesExpanded: Dispatch<SetStateAction<boolean>>;
  expandCellComponent: (props: CellContext<any, any>) => ReactNode;
  editingRowId: string | null;
  setEditingRowId: Dispatch<SetStateAction<string | null>>;
  // include chapter id?
  getExpandedContentCellComponent: (
    lengthColorScale: ColorScale,
    row: Row<any>
  ) => ReactNode;
  podficId: string;
  podficTitle: string;
}

// consider using columns?
// oh noooo the expansion def depends on if there's nested guys. so yeah manage that manually
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

  // hmm can't do the column visibility thing cause would need to define it inside here which doesn't work
  // unless we create the context after the columns, so farther down. not sure abt that one
  const getDefaultTableProps = useCallback(
    (columns: any[]): Partial<CustomTableProps<any>> => {
      return {
        // columns,
        showColumnVisibility: true,
        editingRowId,
        setEditingRowId,
        showRowCount: true,
        rowCanExpand: true,
      };
    },
    [editingRowId]
  );

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
    console.log('getting expanded content');
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
                chapterId={row.getValue('chapter_id')}
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

export default function ChapterTable({
  podficId,
  podficTitle,
  sectionType = SectionType.DEFAULT,
}) {
  // TODO: consider using context. yeah.
  const { chapters, isLoading } = useChaptersForPodfic(podficId);
  const [filesExpanded, setFilesExpanded] = useState(false);
  const chapterTableContext = useChapterTableContext({ podficId, podficTitle });

  const pathname = usePathname();

  const rawColorScale = useLengthColorScale(chapters, 'raw_length');
  const lengthColorScale = useLengthColorScale(chapters, 'length');

  const wordcountColorScale = useColorScale(chapters, 'wordcount');

  const [columnVisibility, setColumnVisibility] = useState({
    chapter_id: false,
    podfic_id: false,
  });

  const columnHelper = createColumnHelper<Chapter>();

  let tableComponent = <></>;

  if (
    sectionType === SectionType.DEFAULT ||
    sectionType === SectionType.MULTIPLE_TO_SINGLE
  )
    tableComponent = <ChapterOnlyTable />;
  else if (sectionType === SectionType.CHAPTERS_SPLIT)
    tableComponent = <ChapterWithSubSectionsTable />;

  // const updateChapter = async (chapter: Chapter) => {
  //   try {
  //     await fetch(`/db/chapters/${chapter.chapter_id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(chapter),
  //     });
  //     await mutate(`/db/chapters/${podficId}`);
  //     setEditingRowId(null);
  //   } catch (e) {
  //     console.error('Error updating chapter:', e);
  //   }
  // };

  return (
    <div
      style={{
        overflowX: 'scroll',
      }}
    >
      <Typography variant='h2'>Chapters for {podficTitle}</Typography>
      <ChapterTableContext.Provider value={chapterTableContext}>
        {tableComponent}
      </ChapterTableContext.Provider>
    </div>
  );
}
