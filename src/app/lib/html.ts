// TODO: fill out this file/format file/move formatting things into here why are they in there
import { FileType } from '../types';
import { format2Digits, getLengthText } from './format';

// many lil functions?
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

// file label info? so like no music?
// note that this is very specific to my file naming sorry
export const generateAALink = ({
  title,
  chapterInfo = {} as any,
  date,
  filetype = 'mp3',
  label = '',
}) => {
  // the date string will always be provided bc it'll be generated for user to see
  // TODO: figure out smart chapter info stuff. assume it's null for now
  // TODO: change as needed based on podfic
  let safeTitle = '';
  if (Object.keys(chapterInfo).length) {
    const chapterName = chapterInfo.chapter_title
      ? `Chapter ${format2Digits(chapterInfo.chapter_number)} - ${
          chapterInfo.chapter_title
        }`
      : `${title} Chapter ${format2Digits(chapterInfo.chapter_number)}`;
    safeTitle = chapterName
      .replaceAll(/\s/g, '_')
      // .replaceAll('-', '')
      .replaceAll(/'/g, '');
  } else {
    safeTitle = title.replaceAll(/\s/g, '_').replaceAll(/'/g, '');
  }
  console.log({ safeTitle });
  const fullTitle = `https://podfic.jinjurly.com/audfiles2/${date}_${safeTitle}${
    label === 'Without Music'
      ? '_(no_music)'
      : label === `Without Reader's Notes`
      ? '_(no_notes)'
      : ''
  }.${filetype}`;
  console.log({ fullTitle });
  return fullTitle;
};

export const generateHTMLAudioficArchive = (
  podfic: Podfic & Work & CoverArt,
  files: (File & FileLink)[]
) => {
  let htmlString = ``;
  if (!podfic.chaptered || podfic.posted_unchaptered) {
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
    // TODO: include splitting into sections
    podfic.chapters?.forEach((chapter) => {
      let filteredFiles = files.filter(
        (file) => file.chapter_id === chapter.chapter_id
      );
      console.log({ filteredFiles });
      filteredFiles = filteredFiles.sort((a, b) =>
        !a.label || (a.label.includes('With') && !a.label.includes('Without'))
          ? -1
          : 1
      );
      console.log({ filteredFiles });
      if (!filteredFiles.length) return;
      htmlString = `${htmlString}chapter ${format2Digits(
        chapter.chapter_number
      )}${
        chapter.chapter_title ? ` - ${chapter.chapter_title.toLowerCase()}` : ''
      }\n`;
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
export const generateHTMLAzdaema = (
  podfic: Podfic & Work & Author & CoverArt,
  files: File[],
  resources: Resource[],
  defaultPodficcer: Podficcer,
  chapter?: Chapter,
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
  // TODO: figure out chaptered
  if (!podfic.chaptered || podfic.posted_unchaptered) {
    // const filteredFiles = files.filter((file) => file.is_direct);
    const filteredFiles = files.filter((file) => Boolean(file));
    // and yeah this is just trying to be smart but it's there for you to edit lol
    if (filteredFiles.length === 1) {
      const file = filteredFiles[0];
      htmlString += `<h3>Details</h3>`;
      htmlString += `<ul>`;
      // TODO: handle multiple files
      htmlString += `<li><b>Length:</b> ${getLengthText(file.length)}</li>`;
      const filetype = Object.entries(FileType).find(
        ([_key, value]) => value === file.filetype
      )?.[0];
      htmlString += `<li><b>File type:</b> ${filetype} (${file.size} MB)</li>`;
    } else {
      console.log('not supported');
    }

    // TODO: this changes depending on whether information was given above
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
  } else if (!!chapter && !!Object.keys(chapter).length) {
    // TODO: may need to filter the files for this chapter
    const filteredFiles = files.filter((file) => Boolean(file));
    // this is assuming just direct links for now we will work on it. also more code needs to be shared don't worry about it
    // TODO: include all chapters html in first chapter
    if (filteredFiles.length) {
      htmlString += `<h3>Chapter ${chapter.chapter_number}${
        chapter.chapter_title ? `: ${chapter.chapter_title}` : ''
      }</h3>`;
      if (filteredFiles.length === 1) {
        htmlString += `<ul>`;
        htmlString += `<li><b>Length:</b> ${getLengthText(
          filteredFiles[0].length
        )}</li>`;
        const filetype = Object.entries(FileType).find(
          ([_key, value]) => value === filteredFiles[0].filetype
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
  htmlString += `<li><b>Text:</b> <a href="${
    chapter ? chapter.link : podfic.link
  }">${
    chapter
      ? `${podfic.nickname ?? podfic.title} Chapter ${chapter.chapter_number}${
          chapter.chapter_title ? `: ${chapter.chapter_title}` : ''
        }`
      : podfic.nickname ?? podfic.title
  }</a></li>`;
  // TODO: support multiple authors, if only by manually looking at string
  htmlString += `<li><b>Author:</b> <a href="${podfic.ao3}">${podfic.username}</a></li>`;
  // TODO: support multiple readers, need to be able to pull from the podficcer thing. do links too
  const readers = podfic.podficcers ?? [defaultPodficcer];
  htmlString += `<li><b>Reader${readers.length > 1 ? 's' : ''}:</b>`;
  readers.forEach((reader, i) => {
    htmlString += ` <a href="${
      reader.profile ?? `https://archiveofourown.org/users/${reader.username}`
    }">${reader.username}</a>`;
    if (i !== readers.length - 1) htmlString += ',';
  });
  htmlString += `</li>`;
  // TODO: cover artist link as well
  if (
    podfic.cover_artist_name &&
    podfic.cover_artist_name !== defaultPodficcer.username
  ) {
    htmlString += `<li><b>Cover art:</b> <a href="${coverArtistProfile}">${podfic.cover_artist_name}</a></li>`;
  }
  // TODO: photo for cover art as well, + other resources incl. music. possibly smartly giving the up class as well? we'll see
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

// TODO: resources also, when there's music
export const generateHTMLBluedreamingChapter = (
  podfic: Podfic & Work & Author & CoverArt,
  chapter: Chapter,
  files: File[],
  resources: Resource[]
) => {
  let htmlString = ``;
  htmlString += `<div class="podfic">`;
  if (podfic.coverArt) {
    htmlString += `<p><img src="${podfic.coverArt.image_link}" /></p>`;
  }
  // chapter title but i dont do that rn
  htmlString += `<h3>Chapter ${chapter.chapter_number}</h3>`;

  files.sort((a, b) => (a.label === 'With Music' ? -1 : 1));

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
