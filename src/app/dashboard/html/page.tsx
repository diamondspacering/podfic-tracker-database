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
import {
  createUpdateFileLink,
  saveChapterHTML,
  savePodficHTML,
} from '@/app/lib/updaters';
import { usePodficcer } from '@/app/lib/swrLoaders';

// TODO: swr?
export default function Page() {
  const searchParams = useSearchParams();

  const [podficId, setPodficId] = useState<number | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

  // --Data--
  const [podfic, setPodfic] = useState<PodficFull>({} as PodficFull);
  const [chapter, setChapter] = useState<Chapter>({} as Chapter);
  const [files, setFiles] = useState<File[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);

  // TODO: use loading states
  const [podficLoading, setPodficLoading] = useState(true);
  const [chapterLoading, setChapterLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);

  const [isLoading, setIsLoading] = useState(true);

  // -- HTML Generation --
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [generatedHTML, setGeneratedHTML] = useState('');
  const editorRef = useRef<ReactCodeMirrorRef | null>(null);

  // -- Config --
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
    searchParams.set('podfic_id', podficId ? podficId.toString() : 'null');
    searchParams.set('chapter_id', chapterId ? chapterId.toString() : 'null');

    if (!!Object.keys(chapter).length && chapter.chapter_number > 1) {
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
  }, [podficId, chapterId, chapter, podfic.ao3_link, podfic.link]);

  useEffect(() => console.log({ podfic }), [podfic]);
  useEffect(() => console.log({ files }), [files]);
  useEffect(() => console.log({ generatedHTML }), [generatedHTML]);

  useEffect(() => setFilteredResources(resources), [resources]);

  const fetchPodfic = useCallback(async (podficId) => {
    const response = await fetch(
      `/db/podfics/${podficId}?with_cover_art=true&with_author=true&with_podficcers=true`
    );
    const data = await response.json();
    setPodfic(data);
    if (data.html_string) {
      console.log('setting generated html from podfic html');
      setGeneratedHTML(podfic.html_string);
    }
  }, []);

  const fetchChapter = useCallback(async (chapterId) => {
    // different endpoint than for all chapters in the podfic!
    const response = await fetch(`/db/chapters?chapter_id=${chapterId}`);
    const data = await response.json();
    setChapter(data);
    if (data.html_string) {
      console.log('setting generated html from chapter html');
      setGeneratedHTML(chapter.html_string);
    }
  }, []);

  const fetchFiles = useCallback(async (podficId, chapterId) => {
    console.log('fetchfiles running');
    let response = null;
    if (!chapterId)
      response = await fetch(
        `/db/files?podfic_id=${podficId}&with_chapters=true`
      );
    else
      response = await fetch(
        `/db/files?podfic_id=${podficId}&chapter_id=${chapterId}`
      );
    const data = await response.json();
    setFiles(data);
  }, []);

  const fetchResources = useCallback(async (podficId, chapterId) => {
    console.log('fetchresources running');
    let response = null;
    if (!chapterId)
      response = await fetch(
        `/db/resources?podfic_id=${podficId}&with_chapters=true`
      );
    else
      response = await fetch(
        `/db/resources?podfic_id=${podficId}&chapter_id=${chapterId}`
      );
    const data = await response.json();
    setResources(data);
  }, []);

  const updateData = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams);
    const podficId = parseInt(params.get('podfic_id'));
    const chapterId = parseInt(params.get('chapter_id'));
    console.log({ podficId, chapterId });

    if (isNaN(podficId)) setPodfic({} as PodficFull);
    else await fetchPodfic(podficId);
    if (isNaN(chapterId)) setChapter({} as Chapter);
    else await fetchChapter(chapterId);

    await fetchFiles(
      isNaN(podficId) ? null : podficId,
      isNaN(chapterId) ? null : chapterId
    );
    await fetchResources(
      isNaN(podficId) ? null : podficId,
      isNaN(chapterId) ? null : chapterId
    );

    setPodficId(isNaN(podficId) ? null : podficId);
    setChapterId(isNaN(chapterId) ? null : chapterId);

    setIsLoading(false);
  }, [searchParams, fetchPodfic, fetchChapter, fetchFiles, fetchResources]);

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
  useEffect(() => {
    if (generateChapterLinks && !generatedLinks.length) {
      // TODO: change this as needed based on podfic
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
        files,
        filteredResources,
        defaultPodficcer,
        Object.keys(chapter).length ? chapter : undefined,
        coverArtist?.profile
      );
      setGeneratedHTML(beautify.html(generated));
    } else if (selectedTemplate === 'bluedreaming') {
      console.log('bluedreaming');
      if (Object.keys(chapter).length !== 0) {
        const generated = generateHTMLBluedreamingChapter(
          podfic,
          chapter,
          files,
          resources
        );
        setGeneratedHTML(beautify.html(generated));
      } else {
        const generated = generateHTMLBluedreaming(podfic, files);
        setGeneratedHTML(beautify.html(generated));
      }
    }
  }, [selectedTemplate, files, resources, podfic, chapter, filteredResources]);

  // TODO: format on paste?

  const saveHTML = useCallback(async () => {
    if (Object.keys(chapter).length !== 0) {
      await saveChapterHTML(chapter.chapter_id, generatedHTML);
    } else {
      await savePodficHTML(podfic.podfic_id, generatedHTML);
    }
    console.log('saved html');
  }, [podfic, chapter, generatedHTML]);

  // TODO:
  // - better loading state
  // - add drag & drop, or at least select which resources are included
  // - better reload from DB, also load template?
  // - select podfic/chapter if not already selected
  // - proper chaptered support
  //  - is_chapter state variable?

  return (
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
          <a href={podfic.link}>{podfic.link}</a>
          <IconButton
            onClick={() => navigator.clipboard.writeText(podfic.link)}
            sx={{ width: 'fit-content' }}
          >
            <CopyAll />
          </IconButton>
        </div>
        {podfic.ao3_link && (
          <p>
            <a href={podfic.ao3_link} target='_blank'>
              Podfic link
            </a>
          </p>
        )}
        <p>{`Author: ${podfic.username}`}</p>
        <p>{`Rating: ${podfic.rating}, category: ${podfic.category}, relationship: ${podfic.relationship}`}</p>
        <p>Length: {getLengthText(podfic.length)}</p>
        {!!Object.keys(chapter).length && (
          <p>Chapter length: {getLengthText(chapter.length)}</p>
        )}
        {podfic.notes?.map((note, i) => (
          <p key={i}>
            <b>{`${note.label}: `}</b>
            {note.value}
          </p>
        ))}
        {Object.keys(chapter)?.length > 0 &&
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
                <a href={resource.link}>{resource.label}</a>
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
      <a href={postingURL} target='_blank'>
        Post
      </a>

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
            label='Generate links for chapters based on single date?'
            control={
              <Checkbox
                checked={generateChapterLinks}
                onChange={(e) => setGenerateChapterLinks(e.target.checked)}
              />
            }
          />
        </>
      )}
      {/* TODO: at least be able to select what resources to include, & reorder files */}

      <CodeMirror
        value={generatedHTML}
        onChange={setGeneratedHTML}
        extensions={[html({ autoCloseTags: true })]}
        theme={okaidia}
        ref={editorRef}
      />
      {/* TODO: show a thing that it's been copied? the little toast or snackbar or whatever? */}
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
      {/* TODO: also be able to save specific HTML, with specific label? like for template or custom? just save it as a note for the podfic probably? maybe a resource.... */}
    </div>
  );
}
