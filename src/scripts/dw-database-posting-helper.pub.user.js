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
const PODFIC_TAG = 'podfic';

(() => {
  const url = new URL(window.location.href);
  const search_params = new URLSearchParams(url.search);
  const section_id = search_params.get('section_id');
  const podfic_id = search_params.get('podfic_id');
  const chapter_id = search_params.get('chapter_id');

  async function fetchDatabaseData() {
    console.log('fetching from db');
    const data = await fetch(
      `http://${APP_URL}/db/post?format=dw&section_id=${section_id}&podfic_id=${podfic_id}&chapter_id=${chapter_id}`,
    );

    const parsedData = await data.json();

    return parsedData;
  }

  function setPostContent(html_string) {
    $('textarea#draft').val(html_string);
  }

  function updatePostContent(callback) {
    const existingPostContent = $('textarea#draft').val();

    const dummyElement = document.createElement('div');
    dummyElement.innerHTML = existingPostContent;

    callback(dummyElement);

    setPostContent(dummyElement.innerHTML);
  }

  function addWarnings(warnings) {
    updatePostContent((dummyElement) => {
      const filteredWarnings = warnings.filter(
        (warning) => warning !== 'No Archive Warnings Apply',
      );
      if (!filteredWarnings.length) {
        $($(dummyElement).find('#warnings-wrapper')).remove();
      } else {
        $($(dummyElement).find('#warnings')).text(filteredWarnings.join(', '));
      }
    });
  }

  function getSelectedFreeforms() {
    const checkboxes = $('#tag-selector input:checked')
      .toArray()
      .map((box) => box.nextSibling.innerText);
    return checkboxes;
  }

  function addFreeformTags() {
    const selectedFreeforms = getSelectedFreeforms();
    updatePostContent((dummyElement) =>
      $($(dummyElement).find(`#selected-freeforms`)).text(
        selectedFreeforms.join(', '),
      ),
    );
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
      $(tagSelectorDiv).append(document.createElement('br'));
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

    const dbData = await fetchDatabaseData();
    console.log({ dbData });
    const { title, fandom_name, warnings, summary, freeforms, html_string } =
      dbData;

    setPostContent(html_string);
    $('input#subject').val(`[Podfic] ${title}`);
    $('input#prop_taglist').val(`${PODFIC_TAG}, fandom:${fandom_name}`);
    updatePostContent((dummyElement) =>
      $($(dummyElement).find(`#summary`)).html(summary),
    );
    addWarnings(warnings);

    createTagSelector(freeforms, html_string);
  }

  $(document).ready(() => {
    if (!section_id && !podfic_id && !chapter_id) return;

    console.log('filling data');

    prefillPostingForm();
  });
})();
