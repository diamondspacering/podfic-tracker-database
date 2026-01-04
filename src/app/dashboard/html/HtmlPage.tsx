'use client';

import { useSearchParams } from 'next/navigation';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from '@/app/dashboard/dashboard.module.css';
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { htmlTemplates } from '@/app/lib/dataGeneral';
import {
  formatDateString,
  generateAADate,
  getLengthText,
} from '@/app/lib/format';
import { generateHTMLBluedreaming } from '@/app/lib/html';
import { generateHTMLBluedreamingChapter } from '@/app/lib/html';
import { generateHTMLAzdaema } from '@/app/lib/html';
import { generateHTMLAudioficArchive } from '@/app/lib/html';
import { generateAALink } from '@/app/lib/html';
import { CopyAll, Save } from '@mui/icons-material';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { okaidia } from '@uiw/codemirror-theme-okaidia';
import beautify from 'js-beautify';
import GeneratedLinksDialog from './GeneratedLinksDialog';
import { createUpdateFileLink, saveSectionHTML } from '@/app/lib/updaters';
import { usePodficcer } from '@/app/lib/swrLoaders';
import ExternalLink from '@/app/ui/ExternalLink';
import { SectionType } from '@/app/types';
import { getLengthValue } from '@/app/lib/lengthHelpers';
import { getIsPostedChaptered } from '@/app/lib/utils';

export default function HtmlPage() {
  const searchParams = useSearchParams();

  const [podficId, setPodficId] = useState<number | null>(null);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

  // --Data--
  const [podfic, setPodfic] = useState<PodficFull>({} as PodficFull);
  const [section, setSection] = useState<Section>({} as Section);
  const [sectionType, setSectionType] = useState<SectionType | null>(null);
  const [chapter, setChapter] = useState<Chapter>({} as Chapter);
  const [files, setFiles] = useState<File[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

  const isPostedChaptered = useMemo(
    () => getIsPostedChaptered(sectionType, podfic.chaptered),
    [podfic.chaptered, sectionType]
  );

  // -- Loading State --
  const [podficLoading, setPodficLoading] = useState(true);
  const [sectionLoading, setSectionLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [resourcesLoading, setResourcesLoading] = useState(true);
  const isLoading = useMemo(
    () =>
      podficLoading ||
      sectionLoading ||
      chapterLoading ||
      filesLoading ||
      resourcesLoading,
    [
      chapterLoading,
      filesLoading,
      podficLoading,
      resourcesLoading,
      sectionLoading,
    ]
  );

  // -- HTML Generation --
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedHTML, setGeneratedHTML] = useState('');
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  // -- AA HTML Generation --
  const [generateChapterLinks, setGenerateChapterLinks] = useState(false);
  const [generatedLinks, setGeneratedLinks] = useState<any[]>([]);
  const [generatedFilesDialogOpen, setGeneratedFilesDialogOpen] =
    useState(false);
  const [aaDate, setAADate] = useState(
    generateAADate(formatDateString(new Date()))
  );

  const { podficcer: defaultPodficcer } = usePodficcer(1);
  const { podficcer: coverArtist } = usePodficcer(
    podfic?.coverArt?.podficcer_id ?? 1
  );

  const postingURL = useMemo(() => {
    const searchParams = new URLSearchParams();
    searchParams.set('section_id', sectionId ? sectionId.toString() : 'null');
    searchParams.set('podfic_id', podficId ? podficId.toString() : 'null');
    searchParams.set('chapter_id', chapterId ? chapterId.toString() : 'null');

    if (isPostedChaptered && !!podfic.ao3_link) {
      const url = new URL(
        `${
          podfic.ao3_link.slice(-1) === '/'
            ? podfic.ao3_link
            : `${podfic.ao3_link}/`
        }chapters/new`
      );
      url.search = searchParams.toString();
      return url.toString();
    } else {
      const url = new URL('https://archiveofourown.org/works/new');
      searchParams.set('work_link', podfic.link);
      url.search = searchParams.toString();
      return url.toString();
    }
  }, [
    sectionId,
    podficId,
    chapterId,
    isPostedChaptered,
    podfic.ao3_link,
    podfic.link,
  ]);

  useEffect(() => console.log({ podfic }), [podfic]);
  useEffect(() => console.log({ files }), [files]);
  useEffect(() => console.log({ generatedHTML }), [generatedHTML]);

  useEffect(() => setFilteredResources(resources), [resources]);

  useEffect(() => setSectionType(podfic.section_type), [podfic.section_type]);

  const fetchPodfic = useCallback(async (podficId) => {
    setPodficLoading(true);
    if (podficId) {
      const response = await fetch(
        `/db/podfics/${podficId}?with_cover_art=true&with_author=true&with_podficcers=true&with_section_chapters=true`
      );
      const data = await response.json();
      setPodfic(data);
      setPodficLoading(false);
      return data;
    }
    setPodficLoading(false);
  }, []);

  const fetchChapter = useCallback(async (chapterId) => {
    setChapterLoading(true);
    // different endpoint than for all chapters in the podfic!
    if (chapterId) {
      const response = await fetch(`/db/chapters?chapter_id=${chapterId}`);
      const data = await response.json();
      setChapter(data);
    }
    setChapterLoading(false);
  }, []);

  const fetchSection = useCallback(async (sectionId) => {
    setSectionLoading(true);
    if (sectionId) {
      const response = await fetch(`/db/sections/${sectionId}`);
      const data = await response.json();
      setSection(data);
      if (data.html_string) {
        console.log('setting generated html from section');
        setGeneratedHTML(data.html_string);
      }

      if (data.podfic_id) {
        setPodficId(data.podfic_id);
      }

      if (data.chapters?.length) {
        setChapterId(data.chapters[0].chapter_id);
      }
    }
    setSectionLoading(false);
  }, []);

  const fetchFiles = useCallback(async (podficId, sectionId) => {
    setFilesLoading(true);
    if (podficId) {
      console.log('fetchfiles running');
      let response = null;
      if (!sectionId) {
        response = await fetch(
          `/db/files?podfic_id=${podficId}&with_chapters=true`
        );
      } else {
        response = await fetch(
          `/db/files?podfic_id=${podficId}&section_id=${sectionId}`
        );
      }
      const data = await response.json();
      setFiles(data);
    }
    setFilesLoading(false);
  }, []);

  const fetchResources = useCallback(async (podficId, sectionId) => {
    setResourcesLoading(true);
    if (podficId) {
      console.log('fetchresources running');
      let response = null;
      if (!sectionId)
        response = await fetch(
          `/db/resources?podfic_id=${podficId}&with_chapters=true`
        );
      else
        response = await fetch(
          `/db/resources?podfic_id=${podficId}&section_id=${sectionId}`
        );
      const data = await response.json();
      setResources(data);
    }
    setResourcesLoading(false);
  }, []);

  useEffect(() => {
    fetchPodfic(podficId);
  }, [fetchPodfic, podficId]);

  useEffect(() => {
    fetchChapter(chapterId);
  }, [chapterId, fetchChapter]);

  useEffect(() => {
    fetchSection(sectionId);
  }, [fetchSection, sectionId]);

  useEffect(() => {
    fetchFiles(podficId, sectionId);
    fetchResources(podficId, sectionId);
  }, [fetchFiles, fetchResources, podficId, sectionId]);

  const updateData = useCallback(async () => {
    const params = new URLSearchParams(searchParams);
    const podficId = parseInt(params.get('podfic_id'));
    const sectionId = parseInt(params.get('section_id'));
    const chapterId = parseInt(params.get('chapter_id'));

    setPodficId(isNaN(podficId) ? null : podficId);

    setChapterId(isNaN(chapterId) ? null : chapterId);

    setSectionId(isNaN(sectionId) ? null : sectionId);
  }, [searchParams]);

  useEffect(() => {
    updateData();
  }, [searchParams, updateData]);

  const submitGeneratedFiles = useCallback(async () => {
    console.log({ generatedLinks });
    const fileLinkPromises = generatedLinks.map(async (link) =>
      createUpdateFileLink(link)
    );
    await Promise.all(fileLinkPromises);
    // refetch files & set generated html
    await fetchFiles(podfic.podfic_id, null);
    // and then it should generate the html itself?
  }, [fetchFiles, generatedLinks, podfic.podfic_id]);

  // link generation
  // TODO: update this to work correctly with section updates
  /*
  useEffect(() => {
    if (generateChapterLinks && !generatedLinks.length) {
      // change this as needed based on podfic
      console.log(files.sort((a, b) => a.chapter_id - b.chapter_id));
      const generated = files
        .sort((a, b) => a.chapter_id - b.chapter_id)
        .filter((file) => !!file.chapter_id)
        .map((file) => ({
          file_id: file.file_id,
          host: 'audiofic archive',
          is_direct: true,
          link: generateAALink({
            title: podfic.nickname ?? podfic.title,
            chapterInfo: {
              chapter_number:
                podfic.chapters?.find(
                  (chapter) => chapter.chapter_id === file.chapter_id
                )?.chapter_number ?? 0,
              chapter_title:
                podfic.chapters?.find(
                  (chapter) => chapter.chapter_id === file.chapter_id
                )?.chapter_title ?? '',
            },
            date: aaDate,
            filetype: file.filetype,
            label: file.label,
          }),
        }));
      setGeneratedLinks(generated);
      setGeneratedFilesDialogOpen(true);
    }
  }, [generateChapterLinks, generatedLinks, podfic, files, aaDate]);
  */

  // html generation
  useEffect(() => {
    if (selectedTemplate === 'Audiofic Archive') {
      const aaFiles = files
        .filter((file) =>
          file.links?.some((link) => link.host === 'audiofic archive')
        )
        .map((file) => ({
          ...file,
          ...file.links.find((link) => link.host === 'audiofic archive'),
        }));
      console.log({ aaFiles });
      setGeneratedHTML(generateHTMLAudioficArchive(podfic, aaFiles));
    } else if (selectedTemplate === 'Azdaema') {
      const generated = generateHTMLAzdaema(
        podfic,
        section,
        files,
        filteredResources,
        defaultPodficcer,
        coverArtist?.profile
      );
      setGeneratedHTML(beautify.html(generated));
    } else if (selectedTemplate === 'bluedreaming') {
      console.log('bluedreaming');
      if (isPostedChaptered) {
        const generated = generateHTMLBluedreamingChapter(
          podfic,
          section,
          files,
          resources
        );
        setGeneratedHTML(beautify.html(generated));
      } else {
        const generated = generateHTMLBluedreaming(podfic, files);
        setGeneratedHTML(beautify.html(generated));
      }
    }
    // TODO: investigate if this is needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate, files, resources, podfic, chapter, filteredResources]);

  const saveHTML = useCallback(async () => {
    await saveSectionHTML(sectionId, generatedHTML);
    console.log('saved html');
  }, [sectionId, generatedHTML]);

  return isLoading ? (
    <CircularProgress />
  ) : (
    <div className={`${styles.body} ${styles.flexColumn}`}>
      <GeneratedLinksDialog
        isOpen={generatedFilesDialogOpen}
        onClose={() => setGeneratedFilesDialogOpen(false)}
        files={generatedLinks}
        setFiles={setGeneratedLinks}
        submitCallback={submitGeneratedFiles}
      />

      <Typography variant='h3'>{`HTML Generation ${
        !!podfic && `for ${podfic.title}`
      }`}</Typography>

      <div className={styles.flexRow}>
        <Button variant='contained' onClick={() => console.log(files)}>
          Log files
        </Button>
        <Button variant='contained' onClick={() => console.log(chapter)}>
          Log chapter
        </Button>
        <Button variant='contained' onClick={() => console.log(podfic)}>
          Log podfic
        </Button>
      </div>

      <div>
        <Typography variant='h4'>Fic Info</Typography>
        <div className={styles.flexRow}>
          <ExternalLink href={podfic.link} />
          <IconButton
            onClick={() => navigator.clipboard.writeText(podfic.link)}
            sx={{ width: 'fit-content' }}
          >
            <CopyAll />
          </IconButton>
        </div>
        {podfic.ao3_link && (
          <p>
            <ExternalLink href={podfic.ao3_link}>Podfic link</ExternalLink>
          </p>
        )}
        <p>{`Author: ${podfic.username}`}</p>
        <p>{`Rating: ${podfic.rating}, category: ${podfic.category}, relationship: ${podfic.relationship}`}</p>
        <p>Length: {getLengthText(podfic.length)}</p>
        {getLengthValue(podfic.length) !== getLengthValue(section.length) && (
          <p>Section length: {getLengthText(section.length)}</p>
        )}
        {section.notes?.map((note, i) => (
          <p key={i}>
            <b>{`${note.label}: `}</b>
            {note.value}
          </p>
        ))}
        {isPostedChaptered &&
          resources?.map((resource, i) => (
            <p key={i}>
              <span>
                <Checkbox
                  checked={filteredResources.includes(resource)}
                  onChange={(e) =>
                    setFilteredResources(
                      e.target.checked
                        ? [...filteredResources, resource]
                        : filteredResources.filter(
                            (res) => res.resource_id !== resource.resource_id
                          )
                    )
                  }
                />
                <b>{`${resource.resource_type}: `}</b>
                <ExternalLink href={resource.link}>
                  {resource.label}
                </ExternalLink>
                {resource.notes ? `, ${resource.notes}` : ''}
              </span>
            </p>
          ))}
        <p>
          <b>Est. total length: </b>
          {Math.round(
            (typeof podfic.wordcount === 'string'
              ? parseInt(podfic.wordcount)
              : podfic.wordcount) /
              130 /
              60
          )}{' '}
          hours
        </p>
      </div>

      {/* maybe a button and the openinnew icon? */}
      <ExternalLink href={postingURL}>Post</ExternalLink>

      <div className={styles.flexRow}>
        <TextField
          select
          size='small'
          sx={{
            width: '300px',
          }}
          label='Template'
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          {htmlTemplates.map((template) => (
            <MenuItem key={template} value={template}>
              {template}
            </MenuItem>
          ))}
        </TextField>

        {selectedTemplate === 'Audiofic Archive' && (
          <span>
            Change date:
            <TextField
              size='small'
              type='date'
              value={aaDate}
              onChange={(e) => setAADate(e.target.value)}
            />
          </span>
        )}
      </div>

      {selectedTemplate === 'Audiofic Archive' && !!podfic.chaptered && (
        <>
          <FormControlLabel
            label='Generate links for chapters/sections based on single date?'
            control={
              <Checkbox
                checked={generateChapterLinks}
                onChange={(e) => setGenerateChapterLinks(e.target.checked)}
              />
            }
          />
        </>
      )}

      <CodeMirror
        value={generatedHTML}
        onChange={setGeneratedHTML}
        extensions={[html({ autoCloseTags: true })]}
        theme={okaidia}
        ref={editorRef}
      />
      <div className={styles.flexRow}>
        <IconButton
          onClick={() => navigator.clipboard.writeText(generatedHTML)}
          sx={{ width: 'fit-content' }}
        >
          <CopyAll />
        </IconButton>
        <IconButton onClick={saveHTML} sx={{ width: 'fit-content' }}>
          <Save />
        </IconButton>
      </div>
    </div>
  );
}
