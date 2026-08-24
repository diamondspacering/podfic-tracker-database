// ==UserScript==
// @name         Dreamwidth Podfic Database Posting Helper
// @version      1.0
// @description  Pull in database info to prefill post
// @author       diamondspacering
// @include      https://www.dreamwidth.org/update*
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @grant        GM.getValue
// @grant        GM.setValue
// ==/UserScript==

const APP_URL = 'localhost:3001';

(() => {
  const url = new URL(window.location.href);
  const search_params = new URLSearchParams(url.search);
  const section_id = search_params.get('section_id');
  const podfic_id = search_params.get('podfic_id');
  const chapter_id = search_params.get('chapter_id');
  const work_link = search_params.get('work_link');

  console.log({ podfic_id, section_id, chapter_id, work_link });

  async function fetchDatabaseData() {
    console.log('fetching from db');
    const data = await fetch(
      `http://${APP_URL}/db/post?format=dw&section_id=${section_id}&podfic_id=${podfic_id}&chapter_id=${chapter_id}`,
    );

    const parsedData = await data.json();

    return parsedData;
  }

  function getSelectedFreeforms() {
    const checkboxes = $('#tag-selector input:checked')
      .toArray()
      .map((box) => box.nextSibling.innerText);
    return checkboxes;
  }

  function addFreeformTags() {
    // console.log(selectedFreeforms);
    const selectedFreeforms = getSelectedFreeforms();
    console.log({ selectedFreeforms });
    $('#selected-freeforms').text(selectedFreeforms.join(', '));
  }

  function createTagSelector(freeforms) {
    console.log(freeforms);

    const tagSelectorDiv = document.createElement('div');
    tagSelectorDiv.id = `tag-selector`;
    tagSelectorDiv.style = `clear:both;margin-bottom:1em;`;
    const title = document.createElement('strong');
    title.innerText = 'Tags to include:';
    tagSelectorDiv.append(title);
    tagSelectorDiv.append(document.createElement('br'));
    freeforms.forEach((freeform) => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      const id = freeform.split(' ').join('-');
      checkbox.id = id;
      const label = document.createElement('label');
      label.htmlFor = id;
      label.innerText = freeform;

      $(tagSelectorDiv).append(checkbox);
      $(tagSelectorDiv).append(label);
    });

    $(tagSelectorDiv).append(document.createElement('br'));
    const button = document.createElement('button');
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      addFreeformTags();
    };
    button.textContent = 'Save choices';
    $(tagSelectorDiv).append(button);

    const composerDiv = $.find('#compose-entry')[0];
    console.log(tagSelectorDiv);
    composerDiv.before(document.createElement('br'));
    composerDiv.before(tagSelectorDiv);
  }

  async function prefillPostingForm() {
    console.log('filling posting form');

    // TODO: fetch db data
    const dbData = await fetchDatabaseData();
    console.log({ dbData });
    const { freeforms, html_string } = dbData;

    $('textarea#draft').val(html_string);

    createTagSelector(freeforms);
  }

  // TODO: add css & classes for labels that make them font-weight: normal
  $(document).ready(() => {
    // TODO: button to do this instead? maybe options as well...?
    console.log('filling data');

    prefillPostingForm();
  });
})();
