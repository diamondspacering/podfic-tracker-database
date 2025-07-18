import { getClient } from './db-helpers';
import { PodficStatus } from '../types';

export const fetchChapters = async (podficId) => {
  const client = await getClient();
  const result = await client.query(
    'select * from chapter where podfic_id = $1 order by chapter_number asc',
    [podficId]
  );

  const chapters = result.rows;
  return chapters as Chapter[];
};

export const fetchPodficsFull = async (onlyNonAAPodfics = false) => {
  const client = await getClient();
  const result = await client.query(
    `select *,fandom.name as fandom_name,event.name as event_name,event_parent.name as parent_name from podfic
      inner join work on podfic.work_id = work.work_id
      left join author on work.author_id = author.author_id
      left join fandom on work.fandom_id = fandom.fandom_id
      left join event on podfic.event_id = event.event_id
      left join event_parent on event.parent_id = event_parent.event_parent_id
    order by added_date asc;`
  );
  const coverArtResult = await client.query(
    'select *,status as cover_art_status from cover_art'
  );
  const chapterResult = await client.query('select * from chapter');
  const partResult = await client.query('select * from part');
  // console.log('parts', partResult.rows);
  const noteResult = await client.query(
    'select * from note where podfic_id is not null'
  );
  const resourceResult = await client.query(
    'select * from resource inner join resource_podfic on resource.resource_id = resource_podfic.resource_id'
  );
  const tagResult = await client.query(
    'select * from tag inner join tag_podfic on tag.tag_id = tag_podfic.tag_id'
  );

  let podfics = result.rows;
  podfics = podfics.map((podfic) =>
    // TODO: parts for these too man
    podfic.chaptered
      ? {
          ...podfic,
          chapters: chapterResult.rows.filter(
            (chapter) => chapter.podfic_id === podfic.podfic_id
          ),
          coverArt:
            coverArtResult.rows.find(
              (coverArt) => coverArt.podfic_id === podfic.podfic_id
            ) ?? null,
          notes: noteResult.rows.filter(
            (note) => note.podfic_id === podfic.podfic_id
          ),
          resources: resourceResult.rows.filter(
            (resource) => resource.podfic_id === podfic.podfic_id
          ),
          tags: tagResult.rows.filter(
            (tag) => tag.podfic_id === podfic.podfic_id
          ),
        }
      : {
          ...podfic,
          coverArt:
            coverArtResult.rows.find(
              (coverArt) => coverArt.podfic_id === podfic.podfic_id
            ) ?? null,
          parts: partResult.rows.filter(
            (part) => part.podfic_id === podfic.podfic_id
          ),
          notes: noteResult.rows.filter(
            (note) => note.podfic_id === podfic.podfic_id
          ),
          resources: resourceResult.rows.filter(
            (resource) => resource.podfic_id === podfic.podfic_id
          ),
          tags: tagResult.rows.filter(
            (tag) => tag.podfic_id === podfic.podfic_id
          ),
        }
  );

  if (onlyNonAAPodfics) {
    console.log('getting podfics');
    const allFilesMissingAALinks = (
      await client.query(`
      SELECT file.file_id,podfic_id,chapter_id,length,size,filetype,label,is_plain,string_agg(host, ',') from file
      LEFT JOIN file_link on file_link.file_id = file.file_id
      GROUP BY file.file_id
      HAVING string_agg(host, ',') NOT LIKE '%audiofic archive%'
    `)
    ).rows;
    // ok just preload in the files ok
    podfics = podfics.filter((podfic) =>
      allFilesMissingAALinks.some((file) => file.podfic_id === podfic.podfic_id)
    );
    // TODO: make sure the files are filtered too? just do it when fetching files I think. preloading files could work too but eh, would have to rejigger stuff
  }

  console.log(podfics.length);

  return podfics as (Podfic & Work & Fandom)[];
};

export const fetchPodficsWithChapters = async () => {
  const client = await getClient();
  const result = await client.query(
    'select *,name as fandom_name from podfic inner join work on podfic.work_id = work.work_id left join fandom on work.fandom_id = fandom.fandom_id order by added_date asc;'
  );
  const chapterResult = await client.query('select * from chapter');

  let podfics = result.rows;
  podfics = podfics.map((podfic) =>
    podfic.chaptered
      ? {
          ...podfic,
          chapters: chapterResult.rows.filter(
            (chapter) => chapter.podfic_id === podfic.podfic_id
          ),
        }
      : podfic
  );

  return podfics as (Podfic & Work & Fandom)[];
};

export const fetchPodficsWithWorksStringified = async () => {
  const client = await getClient();
  const result = await client.query(
    'select * from podfic inner join work on podfic.work_id = work.work_id order by title asc;'
  );

  return JSON.stringify(result.rows);
};

export const fetchPodfic = async (podficId) => {
  const client = await getClient();
  const result = await client.query(
    `
    select * from podfic inner join work on podfic.work_id = work.work_id where podfic_id = $1;
  `,
    [podficId]
  );

  return result.rows[0] as Podfic & Work;
};

export const fetchAuthors = async () => {
  const client = await getClient();
  const result = await client.query('select * from author');
  return result.rows as Author[];
};

export const fetchFandoms = async () => {
  const client = await getClient();
  const result = await client.query(`
    select fandom_id,fandom_category_id,fandom.name as fandom_name,category_id,fandom_category.name as category_name from fandom inner join fandom_category on fandom.category_id = fandom_category.fandom_category_id order by fandom_category.name,fandom.name asc;
  `);

  return result.rows as unknown as (Fandom & FandomCategory)[];
};

export const fetchFandomCategories = async () => {
  const client = await getClient();
  const result = await client.query(`
    select fandom_category_id,name as category_name from fandom_category order by name asc;
  `);

  return result.rows as FandomCategory[];
};

export const fetchPodficChapters = async (podficId) => {
  const client = await getClient();
  const result = await client.query(`
    select * from chapter where podfic_id = ${podficId};
  `);

  return result.rows as Chapter[];
};

export const fetchInProgressPodfics = async () => {
  const client = await getClient();
  const result = await client.query(
    `
      select * from podfic inner join work on podfic.work_id = work.work_id where status != $1 and status != $2 and status != $3 order by updated_at desc;
    `,
    [PodficStatus.PLANNING, PodficStatus.FINISHED, PodficStatus.POSTED]
  );

  return result.rows as (Podfic & Work)[];
};

export const fetchVoiceteams = async () => {
  const client = await getClient();

  const result = await client.query(
    `select * from event where name like '%Voiceteam%' or name like '%Mystery Box%'`
  );
  return result.rows;
};

export const fetchRecordedToday = async () => {
  const client = await getClient();

  const result = await client.query(`
    select sum(length), count(length), date from recording_session where date > current_date - interval '2 days' group by date order by date desc;
  `);
  return result.rows[0];
};
