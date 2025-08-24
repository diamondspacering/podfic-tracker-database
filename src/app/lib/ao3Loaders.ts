import { Cheerio, load } from 'cheerio';
import makeFetchCookie from 'fetch-cookie';
import parse, { HTMLElement } from 'node-html-parser';
import { WorkMetadata } from '../forms/podfic/metadataHelpers';
import { getWork } from '@bobaboard/ao3.js';

// ao3 login code from ao3.js PR
const AO3_LOGIN_URL = 'https://archiveofourown.org/users/login';
const AO3_SESSION_COOKIE = '_otwarchive_session';

const cookieJar = new makeFetchCookie.toughCookie.CookieJar();
const fetchCookie = makeFetchCookie(fetch, cookieJar);

export default function loginFetcher() {
  return async (...params: Parameters<typeof fetch>) => {
    const username = process.env.AO3_USERNAME;
    const password = process.env.AO3_PWD;
    const url = getUrl(params[0]);
    console.log('Checking session cookie');
    const session = (await cookieJar.getCookies(url)).find(
      (cookie) => cookie.key === AO3_SESSION_COOKIE
    );
    if (!session || (session.expires && session.expires <= new Date()))
      await login(username, password);
    console.log('Making request to url', params[0]);
    return await fetchCookie(...params);
  };
}

async function login(username: string, password: string): Promise<void> {
  console.log('Getting login form');
  const loginForm = await fetchCookie(AO3_LOGIN_URL);
  const token = getAuthenticityToken(parse(await loginForm.text()));
  if (!token) throw new Error('Could not find authenticity token');
  const payload = getLoginPayload(username, password, token);
  const body = new URLSearchParams(payload).toString();
  console.log('Logging in');
  await fetchCookie(AO3_LOGIN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': body.length.toString(),
    },
    body,
  });
}

function getAuthenticityToken(element: HTMLElement): string | undefined {
  return element
    .querySelector('form.new_user')
    ?.querySelectorAll('input')
    ?.find((x) => x.getAttribute('name') == 'authenticity_token')
    ?.getAttribute('value');
}

function getLoginPayload(username: string, password: string, token: string) {
  const payload = {
    authenticity_token: token,
    'user[login]': username,
    'user[password]': password,
    commit: 'Log+in',
  };
  return payload;
}

function getUrl(requestInfo: RequestInfo | URL): URL {
  return typeof requestInfo === 'string'
    ? new URL(requestInfo)
    : requestInfo instanceof URL
    ? requestInfo
    : new URL(requestInfo.url);
}

const fetchWork = async (workUrl: string) => {
  const initialWork = await getWork({ workId: workUrl.split('/').pop() });
  let fetcher = fetch;
  if (initialWork.locked) fetcher = loginFetcher();
  const result = await fetcher(workUrl);
  const text = await result.text();
  return text;
};

// export const login = async () => {
//   console.log('logging in to AO3');
//   const username = process.env.AO3_USERNAME;
//   const password = process.env.AO3_PWD;

//   const response = await fetch('https://archiveofourown.org/users/login', {
//     headers: {
//       Accept: 'text/html,*/*',
//       Host: 'archiveofourown.org',
//       Connection: 'keep-alive',
//       'User-Agent':
//         'ozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//   });
//   // console.log({ response });
//   const text = await response.text();
//   // console.log({ text });

//   const $ = load(text);
//   const authenticityToken = $('input[name=authenticity_token]').attr('value');

//   // const data = {
//   //   'user[login]': username,
//   //   'user[password]': password,
//   //   authenticity_token: authenticityToken,
//   // };

//   // const formData = new FormData();
//   // formData.set('user[login]', username);
//   // formData.set('user[password]', password);
//   // formData.set('authenticity_token', authenticityToken);

//   // const responsePage = await fetch('https://archiveofourownorg/users/login', {
//   //   method: 'POST',
//   //   headers: {
//   //     Accept: 'text/html,*/*',
//   //     Host: 'archiveofourown.org',
//   //     Connection: 'keep-alive',
//   //     'User-Agent':
//   //       'ozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
//   //     'Content-Type': 'application/x-www-form-urlencoded',
//   //   },
//   //   body: formData,
//   // });

//   // const newUrl = responsePage.url;
//   // console.log({ newUrl });
// };

// ok so this works. so just scrape those pages as expected & return appropriate data. maybe try doing some things for ao3.js? or something? also improve this & make it more like how you do it
export const fetchWorkMetadata = async (workUrl: string) => {
  const text = await fetchWork(workUrl);

  const $ = load(text);
  const title = $('h2.title.heading').text().trim();
  console.log({ title });

  const authors = $('h3.byline.heading').find('a').toArray();
  const authorsString = authors.map((author) => $(author).text()).join(' & ');
  const authorsLink = authors
    .map((author) => `https://archiveofourown.org${$(author).attr('href')}`)
    .join(', ');

  const meta = $('dl.work.meta.group');

  const fandomList = meta
    .find('dd.fandom.tags')
    .find('.tag')
    .toArray()
    .map((fandom) => $(fandom).text());

  // TODO: make this just one
  const ratingList = meta.find('dd.rating.tags').find('.tag').toArray();
  let rating = ratingList.map((rating) => $(rating).text()).join(', ');
  rating = rating.replace('Teen And Up Audiences', 'Teen');
  rating = rating.replace('General Audiences', 'Gen');

  const category = meta.find('dd.category.tags').find('a').text();

  const relationshipList = meta
    .find('dd.relationship.tags')
    .find('.tag')
    .toArray()
    .map((relationship) => $(relationship).text());

  const characterList = meta
    .find('dd.character.tags')
    .find('.tag')
    .toArray()
    .map((character) => $(character).text());

  const wordcount = parseInt(meta.find('dd.words').text().replace(',', ''));

  // TODO: chapters?
  const chapters = meta.find('dd.chapters').text();
  let chapterCountStr = chapters.split('/')[1];
  if (chapterCountStr === '?') {
    chapterCountStr = chapters.split('/')[0];
  }
  const chapterCount = parseInt(chapterCountStr);
  let chaptered = false;
  if (chapterCount > 1) {
    chaptered = true;
  }

  return {
    title,
    authorsString,
    authorsLink,
    fandomList,
    rating,
    category,
    relationshipList,
    characterList,
    wordcount,
    chapterCount,
    chaptered,
  } as WorkMetadata;
};

const fetchFullWork = async (workUrl: string) => {
  let fullWorkUrl = workUrl;
  if (workUrl[workUrl.length - 1] === '/')
    fullWorkUrl = `${workUrl.substring(
      0,
      workUrl.length - 1
    )}?view_full_work=true`;
  else fullWorkUrl = `${workUrl}?view_full_work=true`;

  const text = await fetchWork(fullWorkUrl);

  return text;
};

const getChapterData = (chapterElement) => {
  const $ = load(chapterElement);

  const titleElement = $(chapterElement).find('h3.title');

  const link = $(titleElement).find('a').attr('href');
  const chapterLink = `https://archiveofourown.org${link}`;

  const chapterNumber = $(titleElement).find('a').text().split(' ')[1];

  const titleContents = $($(titleElement).contents()[2]).text().trim();
  let title = null;
  if (titleContents.length > 0) {
    title = titleContents.split(/:(.*)/)[1].trim();
  }

  const chapterText = $(chapterElement)
    .find('div.userstuff.module')
    .text()
    .replaceAll('‘', '')
    .replaceAll('’', '')
    .replaceAll('-', '')
    .replaceAll("'", '');
  const chapterWordcount = chapterText.matchAll(/\w+/g).toArray().length - 2;

  return {
    link: chapterLink,
    chapter_number: parseInt(chapterNumber),
    chapter_title: title,
    wordcount: chapterWordcount,
  } as Chapter;
};

export const fetchChapterMetadata = async (workUrl: string) => {
  const text = await fetchFullWork(workUrl);

  const $ = load(text);
  const chapters = $('div#chapters')
    .find('div.chapter')
    .filter((_i, el) => $(el).attr('id')?.startsWith('chapter-'));
  console.log(chapters.length);

  const chapterData = chapters.map((_i, el) => getChapterData(el)).toArray();
  console.log(`Fetched ${chapterData.length} chapters.`);

  return chapterData;
};
