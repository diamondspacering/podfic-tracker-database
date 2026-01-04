// ==UserScript==
// @name         AO3 Podfic Database Posting Helper
// @version      1.0
// @description  Pull in database info to prefill posting form
// @author       diamondspacering
// @include      https://archiveofourown.org/works/new*
// @include      https://archiveofourown.org/works/*/chapters/new*
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

const DEFAULT_PSEUD = '';
const MULTIVOICE_PSEUD = '';
const DEFAULT_WORKSKIN_NAME = '';
const APP_URL = '';

(() => {
  const lengthBucketsMinutes = ['0-10', '10-20', '20-30', '30-45', '45-60'];
  const lengthBucketsHours = [
    '1-1.5',
    '1.5-2',
    '2-2.5',
    '2.5-3',
    '3-3.5',
    '3.5-4',
    '4-4.5',
    '4.5-5',
    '5-6',
    '6-7',
    '7-10',
    '10-15',
    '15-20',
    'Over 20',
  ];

  const url = new URL(window.location.href);
  const search_params = new URLSearchParams(url.search);
  const section_id = search_params.get('section_id');
  const podfic_id = search_params.get('podfic_id');
  const chapter_id = search_params.get('chapter_id');
  const work_link = search_params.get('work_link');

  console.log({ podfic_id, section_id, chapter_id, work_link });

  async function getOriginalWorkMetadata() {
    let itemsObj = {};
    if (work_link) {
      const data = await $.get(work_link);
      const workTitle = $(data)
        .find('h2.title.heading')?.[0]
        ?.innerText?.trim();

      const title = `${workTitle}`;

      const authorLinks = $(data)
        .find('h3.byline a')
        .map((_index, element) => element.outerHTML)
        .toArray();

      const metaGroup = $(data).find('dl.meta');
      const rating = $(metaGroup).find('dd.rating.tags')[0].innerText.trim();
      const warnings = $(metaGroup)
        .find('dd.warning.tags a')
        .map((_index, element) => {
          const text = element.innerText.trim();
          return text === 'Creator Chose Not To Use Archive Warnings'
            ? 'Choose Not To Use Archive Warnings'
            : text;
        })
        .toArray();
      const categories = $(metaGroup)
        .find('dd.category.tags a')
        .map((_index, element) => element.innerText.trim())
        .toArray();
      const fandoms = $(metaGroup)
        .find('dd.fandom.tags a')
        .map((_index, element) => element.innerText.trim())
        .toArray();
      const relationships = $(metaGroup)
        .find('dd.relationship.tags a')
        .map((_index, element) => element.innerText.trim())
        .toArray();
      const characters = $(metaGroup)
        .find('dd.character.tags a')
        .map((_index, element) => element.innerText.trim())
        .toArray();
      const freeforms = $(metaGroup)
        .find('dd.freeform.tags a')
        .map((_index, element) => element.innerText.trim())
        .toArray();

      const chapterCount = $(metaGroup)
        .find('dd.chapters')[0]
        .innerText.trim()
        .split('/')[1];

      // TODO: does the summary need to be sanitized like in the posting helper?
      const summary = $(data).find('div.summary.module .userstuff')[0]
        .innerHTML;

      itemsObj = {
        title,
        authorLinks,
        rating,
        warnings,
        categories,
        fandoms,
        relationships,
        characters,
        freeforms,
        chapterCount,
        summary,
      };
    }
    return itemsObj;
  }

  async function fetchDatabaseData() {
    console.log('fetching from db');
    const data = await fetch(
      `http://${APP_URL}/db/post?section_id=${section_id}&podfic_id=${podfic_id}&chapter_id=${chapter_id}`
    );

    const parsedData = await data.json();

    return parsedData;
  }

  function addTag(element, tag) {
    // adding tag spoofing from: https://github.com/LazyCats-dev/ao3-podfic-posting-helper/blob/main/src/inject.js
    const event = new InputEvent('input', { bubbles: true, data: tag });
    element.value = tag;
    // Replicates the value changing.
    element.dispatchEvent(event);
    // Replicates the user hitting comma.
    element.dispatchEvent(new KeyboardEvent('keydown', { key: ',' }));
  }

  function fillSharedPostingFormElements(html_string, is_multivoice) {
    $(
      `select[id$="author_attributes_ids"] option:contains(${
        is_multivoice ? MULTIVOICE_PSEUD : DEFAULT_PSEUD
      })`
    ).prop('selected', true);

    $('.mce-editor').val(html_string);

    // TODO: posting date as well (in case of drafts that automatically backdate things)
  }

  function fillAddChapterForm(dbData) {
    const { chapter_title: chapterTitle, html_string } = dbData;

    $('#chapter_title').val(chapterTitle);

    fillSharedPostingFormElements(html_string);
  }

  async function fillNewWorkForm(dbData) {
    const {
      chapters,
      length,
      est_length,
      html_string,
      is_multivoice,
      section_type,
      chaptered,
    } = dbData;

    const metadata = await getOriginalWorkMetadata();
    console.log({ metadata });

    const {
      rating,
      warnings,
      fandoms,
      categories,
      relationships,
      characters,
      freeforms,
      chapterCount,
      title,
      summary,
      authorLinks,
    } = metadata;

    $('dd.rating select#work_rating_string').val(rating);

    $('fieldset.warnings input[type="checkbox"]').each((_index, element) => {
      if (warnings.includes(element.value)) {
        $(element).prop('checked', true);
      }
    });

    addTag($('dd.fandom input')[0], fandoms.join(', '));

    $('dd.category input[type="checkbox"]').each((_index, element) => {
      if (categories.includes(element.value)) {
        $(element).prop('checked', true);
      }
    });

    addTag($('dd.relationship input')[0], relationships.join(', '));

    addTag($('dd.character input')[0], characters.join(', '));

    freeforms.push('Podfic');
    let lengthTag = '';
    if (length) {
      const { hours, minutes } = length;
      if (hours > 0) {
        const minutesFraction = minutes / 60;
        const hoursValue = hours + minutesFraction;
        for (const range of lengthBucketsHours) {
          let [low, high] = range.split('-');
          [low, high] = [parseInt(low), parseInt(high)];

          if (low <= hoursValue && hoursValue <= high) {
            lengthTag = `${range} Hours`;
            break;
          }
        }
      } else {
        for (const range of lengthBucketsMinutes) {
          let [low, high] = range.split('-');
          [low, high] = [parseInt(low), parseInt(high)];

          if (low <= minutes && minutes <= high) {
            lengthTag = `${range} Minutes`;
            break;
          }
        }
      }
    }
    lengthTag = `Podfic Length: ${lengthTag}`;
    freeforms.push(lengthTag);
    // TODO: more specific hours/minutes/etc.
    if (est_length) {
      freeforms.push(`estimated finished length about ${est_length} hours`);
    }
    if (!!is_multivoice) {
      freeforms.push('Multivoice and Collaborative Podfic');
    }
    // TODO: options for other tags?
    addTag($('dd.freeform input')[0], freeforms.join(', '));

    $('dd.title input').val(`[Podfic] ${title}`);

    // TODO: probably needs more processing & cleanup
    const transformedSummary = `<blockquote>${summary}</blockquote>Podfic of <a href="${work_link}">${title}</a> by ${authorLinks.join(
      ', '
    )}.`;
    $('dd.summary textarea').val(transformedSummary);

    // TODO: notes support as well
    // possibly a template for end notes?

    $('dt.parent input').click();
    $('#work_parent_work_relationships_attributes_0_url').val(work_link);

    if (chapterCount !== '1') {
      $('#chapters-options-show').click();
      $('#work_wip_length').val(chapterCount);
      if (chapters?.length && chapters[0].chapter_title) {
        $('#work_chapter_attributes_title').val(chapters[0].chapter_title);
      }
    }

    $('select#work_language_id').val('1');

    // OOOHHHH pull config options from db as well??? like name, workskin, etc.?

    $(
      `select#work_work_skin_id option:contains('${DEFAULT_WORKSKIN_NAME}')`
    ).prop('selected', true);

    $('dd.permissions.comments input[value="enable_all"]').click();

    fillSharedPostingFormElements(html_string, is_multivoice);
  }

  async function prefillPostingForm() {
    console.log('filling posting form');

    const dbData = await fetchDatabaseData();

    console.log({ dbData });

    if (
      window.location.href.match(
        /https:\/\/archiveofourown\.org\/works\/\d+\/chapters\/new/
      )
    ) {
      console.log('adding new chapter');
      fillAddChapterForm(dbData);
      return;
    } else {
      await fillNewWorkForm(dbData);
    }
  }

  $(document).ready(() => {
    // TODO: button to do this instead? maybe options as well...?
    console.log('filling data');

    prefillPostingForm();
  });
})();
