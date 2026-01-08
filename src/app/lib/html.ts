import { FileType, SectionType } from '../types';
import { format2Digits, getLengthText } from './format';
import { getIsPostedChaptered } from './utils';

export const getFileHTML = (file: File) => {
  let htmlString = ``;
  if (file.label) {
    htmlString = `${htmlString}<h3>
      ${file.label}
    </h3>`;
  }

  const streaming_links = file.links.filter((link) => link.is_direct);
  if (streaming_links.length) {
    htmlString = `${htmlString}<audio>
    ${streaming_links.map((link) => `<source src="${link.link}">`)}
    </audio>`;
  }
  if (file.links.length) {
    htmlString = `${htmlString}<p>Download from ${file.links
      .map((fileLink) => `<a href="${fileLink.link}">${fileLink.host}</a>`)
      .join(' | ')} (${getLengthText(file.length)}${
      file.size ? `, ${file.size} MB` : ''
    })</p>`;
  }

  return htmlString;
};

export const getEmbedCode = (link: string) => {
  return `<iframe src="${link}&playlist=1&list_height=150" width="100%"></iframe>`;
};

// TODO: chapter_combine support
// change as needed
export const getSectionName = ({
  section,
  sectionType,
  chapter: chapterProp = null,
  includeChapterTitle = true,
  forAA = false,
}: {
  section: Section;
  sectionType: SectionType;
  chapter?: Chapter;
  includeChapterTitle?: boolean;
  forAA?: boolean;
}) => {
  const chapter = chapterProp ?? section.chapters?.[0];
  console.log({ section, chapter });
  if (!chapter) {
    return section.title
      ? section.title
      : `Part ${forAA ? format2Digits(section.number) : section.number}`;
  } else {
    const chapterNumber = forAA
      ? format2Digits(chapter.chapter_number)
      : chapter.chapter_number;
    const chapterName = `Chapter ${chapterNumber}${
      chapter.chapter_title && includeChapterTitle
        ? `${forAA ? ' -' : ':'} ${chapter.chapter_title}`
        : ''
    }`;
    // as usual, redo these as needed based on how you actually name stuff
    if (sectionType === SectionType.CHAPTERS_SPLIT) {
      return section.title
        ? `${section.title} - ${chapterName}`
        : `${chapterName} - Part ${section.number}`;
    } else {
      return chapterName;
    }
  }
};

// note that this is very specific to my file naming sorry
// TODO: does any of this need to change for sections? eh will do it manually
export const generateAALink = ({
  title,
  sectionType,
  chaptered,
  section,
  date,
  filetype = 'mp3',
  label = '',
}) => {
  // the date string will always be provided bc it'll be generated for user to see
  // change as needed based on podfic
  let safeTitle = '';
  if (
    sectionType === SectionType.CHAPTERS_SPLIT ||
    sectionType === SectionType.CHAPTERS_COMBINE ||
    (sectionType === SectionType.DEFAULT && chaptered)
  ) {
    const chapter = section.chapters?.[0];
    if (!!chapter) {
      const chapterName = chapter.chapter_title
        ? getSectionName({ section, sectionType, forAA: true })
        : `${title} ${getSectionName({ section, sectionType, forAA: true })}`;
      safeTitle = chapterName
        .replaceAll(/\s/g, '_')
        // .replaceAll('-', '')
        .replaceAll(/'/g, '');
    }
  } else {
    safeTitle = title.replaceAll(/\s/g, '_').replaceAll(/'/g, '');
  }
  console.log({ safeTitle });
  const fullTitle = `https://podfic.audioficarchive.org/audfiles2/${date}_${safeTitle}${
    label === 'Without Music'
      ? '_(no_music)'
      : label === `Without Reader's Notes`
      ? '_(no_notes)'
      : ''
  }.${filetype}`;
  console.log({ fullTitle });
  return fullTitle;
};

// TODO: this needs to go more based off sections and section type
// TODO: not including chapter names rn
export const generateHTMLAudioficArchive = (
  podfic: Podfic & Work & CoverArt,
  files: (File & FileLink)[]
) => {
  let htmlString = ``;
  const chaptered = getIsPostedChaptered(podfic.section_type, podfic.chaptered);
  if (podfic.section_type === SectionType.CHAPTERS_COMBINE) {
    console.error('Combined chapters are not supported yet!');
    return '';
  }
  if (!chaptered) {
    // const filteredFiles = files.filter((file) => file.is_direct);
    const filteredFiles = files.filter((file) => Boolean(file));
    filteredFiles.forEach((file) => {
      htmlString = `${htmlString}${
        file.label ? `${file.label.toLowerCase()}\n` : ''
      }<audio src="${
        file.link
      }" crossorigin="anonymous" preload="metadata" controls="controls"></audio>\ndownload ${
        file.filetype ?? 'mp3'
      }: <a href="${file.link}">here</a> (r-click or press, and 'save link') [${
        file.size
      } MB, ${getLengthText(file.length)}]\n\n`;
    });
  } else {
    podfic.sections?.forEach((section) => {
      let filteredFiles = files.filter(
        (file) => file.section_id === section.section_id
      );
      console.log({ filteredFiles });
      filteredFiles = filteredFiles.sort((a) =>
        !a.label || (a.label.includes('With') && !a.label.includes('Without'))
          ? -1
          : 1
      );
      console.log({ filteredFiles });
      if (!filteredFiles.length) return;
      const sectionName = getSectionName({
        section,
        sectionType: podfic.section_type,
        forAA: true,
      }).toLowerCase();
      htmlString = `${htmlString}${sectionName}\n`;
      // htmlString = `${htmlString}chapter ${format2Digits(
      //   chapter.chapter_number
      // )}${
      //   chapter.chapter_title ? ` - ${chapter.chapter_title.toLowerCase()}` : ''
      // }\n`;
      filteredFiles.forEach((file) => {
        const fileLink = file.links.find(
          (link) => link.host === 'audiofic archive'
        )?.link;
        htmlString = `${htmlString}${
          file.label ? `${file.label.toLowerCase()}\n` : ''
        }<audio src="${fileLink}" crossorigin="anonymous" preload="metadata" controls="controls"></audio>\ndownload ${
          file.filetype ?? 'mp3'
        }: <a href="${fileLink}">here</a> (r-click or press, and 'save link') [${
          file.size
        } MB, ${getLengthText(file.length)}]\n`;
      });
      htmlString = `${htmlString}\n`;
    });
  }

  htmlString = `${htmlString}comment to the podficcer <a href="${podfic.ao3_link}">here</a>\nread or comment on the text version <a href="${podfic.link}">here</a>`;
  if (podfic.cover_artist_name) {
    htmlString = `${htmlString}\ncover art by ${podfic.cover_artist_name}`;
  }

  return htmlString;
};

// hmm yeah chapters also
// hmmm may need to change order of things if there's multiple authors. but its fiiine
// TODO: rework for sections
export const generateHTMLAzdaema = (
  podfic: Podfic & Work & Author & CoverArt,
  section: Section,
  files: File[],
  resources: Resource[],
  defaultPodficcer: Podficcer,
  coverArtistProfile?: string
) => {
  let htmlString = ``;
  htmlString += `<div class="podfic">`;

  if (podfic.image_link) {
    htmlString += `<div class="cover">`;
    htmlString += `<center><img src="${podfic.image_link}" /></center>`;
    htmlString += `</div>`;
  }

  htmlString += `<div class="content">`;
  const chaptered = getIsPostedChaptered(podfic.section_type, podfic.chaptered);
  const chapter = section.chapters?.[0];
  if (!chaptered) {
    // TODO: specific code for posted unchaptered/multiple to single
    const filteredFiles = files.filter((file) => Boolean(file));
    // tries to be smart, but change as needed based on podfic
    if (filteredFiles.length === 1) {
      const file = filteredFiles[0];
      htmlString += `<h3>Details</h3>`;
      htmlString += `<ul>`;
      htmlString += `<li><b>Length:</b> ${getLengthText(file.length)}</li>`;
      const filetype = Object.entries(FileType).find(
        ([, value]) => value === file.filetype
      )?.[0];
      htmlString += `<li><b>File type:</b> ${filetype} (${file.size} MB)</li>`;
    } else {
      console.log('not supported');
    }

    // this changes depending on whether information was given above
    if (filteredFiles.length) {
      htmlString += `<h3>Streaming & Hosting</h3>`;
      filteredFiles.forEach((file) => {
        if (file.label) htmlString += `<h4>${file.label}</h4>`;
        htmlString += `<center>`;
        const directLinks = file.links?.filter((link) => link.is_direct) ?? [];
        if (directLinks.length > 1) {
          htmlString += `<audio>`;
          directLinks.forEach((link) => {
            htmlString += `<source src="${link.link}">`;
          });
          htmlString += `</audio>`;
        } else if (directLinks.length === 1) {
          htmlString += `<audio src="${file.links[0].link}"></audio>`;
        }
        htmlString += `</center>`;
        htmlString += `<ul>`;
        if (filteredFiles.length > 1) {
          if (directLinks.length === 1) {
            htmlString += `<li><a href="${file.links[0].link}">Download ${
              file.filetype
            } from ${file.links[0].host}</a> (${file.size} MB | ${getLengthText(
              file.length
            )})</li>`;
          } else if (directLinks.length > 1) {
            htmlString += `<li>Download ${file.filetype} (${
              file.size
            } MB | ${getLengthText(file.length)}):`;
            directLinks.forEach((link, i) => {
              if (i === 0)
                htmlString += ` <a href="${link.link}">${link.host}</a>`;
              else htmlString += ` | <a href="${link.link}">${link.host}</a>`;
            });
            htmlString += `</li>`;
          }
        } else {
          directLinks.forEach((link) => {
            htmlString += `<li><a href="${link.link}">Download from ${link.host}</a></li>`;
          });
        }
        const embedLinks = file.links?.filter((link) => link.is_embed) ?? [];
        embedLinks.forEach((link) => {
          htmlString += `<p>${getEmbedCode(link.link)}</p>`;
        });
        htmlString += `</ul>`;
        // if (
        //   file.label === 'With Music' &&
        //   resources?.find((resource) => resource.resource_type === 'music')
        // ) {
        //   htmlString += `<p><b>Music:</b> <a href="${
        //     resources.find((resource) => resource.resource_type === 'music')
        //       ?.link
        //   }">here</a></p>`;
        // }
      });
    }
  } else {
    if (podfic.section_type === SectionType.CHAPTERS_COMBINE) {
      throw new Error('Error: combining chapters not supported!');
    }
    // may need to filter the files for this chapter
    const filteredFiles = files.filter((file) => Boolean(file));
    // TODO: include all chapters html in first chapter
    if (filteredFiles.length) {
      htmlString += `<h3>${getSectionName({
        section,
        sectionType: podfic.section_type,
      })}</h3>`;
      if (filteredFiles.length === 1) {
        htmlString += `<ul>`;
        htmlString += `<li><b>Length:</b> ${getLengthText(
          filteredFiles[0].length
        )}</li>`;
        const filetype = Object.entries(FileType).find(
          ([, value]) => value === filteredFiles[0].filetype
        )?.[0];
        htmlString += `<li><b>File type:</b> ${filetype} (${filteredFiles[0].size} MB)</li>`;
        htmlString += `</ul>`;
        const directLinks =
          filteredFiles[0].links?.filter((link) => link.is_direct) ?? [];
        htmlString += `<audio>`;
        directLinks.forEach((link) => {
          htmlString += `<source src="${link.link}">`;
        });
        htmlString += `</audio>`;

        directLinks.forEach((link) => {
          htmlString += `<p><a href="${link.link}">Download from ${link.host}</a></p>`;
        });
      }
    }
  }

  htmlString += `<h3>Credits</h3>`;
  htmlString += `<ul>`;
  const sectionName = getSectionName({
    section,
    sectionType: podfic.section_type,
  });
  // sectionName = sectionName.charAt(0).toLowerCase() + sectionName.slice(1);
  htmlString += `<li><b>Text:</b> <a href="${
    chaptered ? section.text_link : podfic.link
  }">${
    chaptered
      ? `${podfic.nickname ?? podfic.title} ${sectionName}`
      : podfic.nickname ?? podfic.title
  }</a></li>`;
  htmlString += `<li><b>Author:</b> <a href="${podfic.ao3}">${podfic.username}</a></li>`;
  const readers = podfic.podficcers ?? [defaultPodficcer];
  htmlString += `<li><b>Reader${readers.length > 1 ? 's' : ''}:</b>`;
  readers.forEach((reader, i) => {
    htmlString += ` <a href="${
      reader.profile ?? `https://archiveofourown.org/users/${reader.username}`
    }">${reader.username}</a>`;
    if (i !== readers.length - 1) htmlString += ',';
  });
  htmlString += `</li>`;
  if (
    podfic.cover_artist_name &&
    podfic.cover_artist_name !== defaultPodficcer.username
  ) {
    htmlString += `<li><b>Cover art:</b> <a href="${coverArtistProfile}">${podfic.cover_artist_name}</a></li>`;
  }
  resources.forEach((resource) => {
    if (resource.notes) {
      htmlString += `<li><b>${resource.label}:</b> <a href="${resource.link}">${resource.notes}</a></li>`;
    } else {
      htmlString += `<li><b>${resource.resource_type}:</b> <a href="${resource.link}">${resource.label}</a></li>`;
    }
  });
  htmlString += `</ul>`;

  htmlString += `</div></div`;

  return htmlString;
};

// TODO: rework to have section data
export const generateHTMLBluedreamingChapter = (
  podfic: Podfic & Work & Author & CoverArt,
  section: Section,
  files: File[],
  resources: Resource[]
) => {
  let htmlString = ``;
  htmlString += `<div class="podfic">`;
  if (podfic.coverArt) {
    htmlString += `<p><img src="${podfic.coverArt.image_link}" /></p>`;
  }
  // chapter title but i dont do that rn
  htmlString += `<h3>${getSectionName({
    section,
    sectionType: podfic.section_type,
    includeChapterTitle: false,
  })}</h3>`;

  files.sort((a) => (a.label === 'With Music' ? -1 : 1));

  files.forEach((file) => {
    if (file.label) {
      htmlString += `<h4>${file.label}</h4>`;
    }
    const directLinks = file.links?.filter((link) => link.is_direct) ?? [];
    const embedLinks = file.links?.filter((link) => link.is_embed) ?? [];

    if (embedLinks.length >= 1) {
      embedLinks.forEach((link) => {
        htmlString += getEmbedCode(link.link);
      });
    }

    if (directLinks.length >= 1) {
      if (file.filetype === FileType.MP3) {
        htmlString += `\n<audio>`;
        directLinks.forEach((link) => {
          htmlString += `<source src="${link.link}">`;
        });
        htmlString += `</audio>`;
      }
      directLinks.forEach((link) => {
        htmlString +=
          file.filetype === FileType.ZIP
            ? `<p><a href="${link.link}">Download zip of MP3s from ${link.host}</a></p>`
            : `<p><a href="${link.link}">Download from ${link.host}</a></p>`;
      });
    }

    if (file.label === 'With Music') {
      resources.forEach((resource) => {
        if (resource.resource_type === 'Music') {
          htmlString += `<p><b>Music:</b> <a href="${resource.link}">${resource.label}</a></p>`;
        }
      });
    }
  });

  htmlString += `</div>`;

  return htmlString;
};

export const generateHTMLBluedreaming = (
  podfic: Podfic & Work & Author,
  files: File[]
) => {
  let htmlString = ``;
  htmlString += `<div class="podfic">`;
  if (podfic.coverArt) {
    htmlString += `<p><img src="${podfic.coverArt.image_link}" /></p>`;
  }
  htmlString += `<h3>${podfic.title}</h3>`;

  files.forEach((file) => {
    htmlString += `\n<audio>`;
    if (file.links?.length) {
      file.links.forEach(
        (link) => (htmlString += `<source src="${link.link}">`)
      );
    }
    htmlString += `</audio>`;
    file.links?.forEach((link) => {
      htmlString += `<p><a href="${link.link}">Download from ${link.host}</a></p>`;
    });
  });

  htmlString += `</div>`;

  return htmlString;
};
