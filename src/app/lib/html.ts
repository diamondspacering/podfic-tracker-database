// TODO: fill out this file/format file/move formatting things into here why are they in there
import { getLengthText } from './format';

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
