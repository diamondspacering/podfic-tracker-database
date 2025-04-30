'use server';

import { getLengthUpdateString } from './format';
import { getClient } from './db-helpers';
import { PARTIAL_STATUSES, PodficStatus } from '../types';

// TODO: clean this up
export const updateRecordingData = async (data: any) => {
  // console.log({ recordingSessionData: data });

  try {
    data.length = getLengthUpdateString(data.length);

    if (!data.podficId) {
      if (!data.podfic.status) {
        if (data.completesPodfic) {
          data.podfic.status = PodficStatus.RECORDED;
        } else {
          data.podfic.status = PodficStatus.RECORDING;
        }
      }
      data.podficId = (await createUpdatePodfic(data.podfic)).podfic_id;
    }

    // hmm how to default things into null?
    const client = await getClient();
    const result = await client.query(
      `
      insert into recording_session (podfic_id, chapter_id, part_id, date, year, month, length, mic, device, location) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *;
    `,
      [
        data.podficId,
        data.chapterId ? data.chapterId : null,
        data.partId ? data.partId : null,
        data.date ? data.date : null,
        data.year ? data.year : null,
        data.month ? data.month : null,
        data.length,
        data.mic ? data.mic : null,
        data.device ? data.device : null,
        data.location ? data.location : null,
      ]
    );

    if (data.podficId && data.completesPodfic) {
      const statusResult = await client.query(
        `select status from podfic where podfic_id = $1`,
        [data.podficId]
      );
      const status = statusResult.rows[0].status as PodficStatus;
      if (PARTIAL_STATUSES.includes(status) || !status) {
        await client.query(
          `update podfic set status = $1 where podfic_id = $2`,
          [PodficStatus.RECORDED, data.podficId]
        );
      }
    }

    if (data.chapterId && data.completesChapter) {
      const chapterResult = await client.query(
        `select status from chapter where chapter_id = $1`,
        [data.chapterId]
      );
      const status = chapterResult.rows[0].status as PodficStatus;
      if (PARTIAL_STATUSES.includes(status) || !status) {
        await client.query(
          `update chapter set status = $1 where chapter_id = $2`,
          [PodficStatus.RECORDED, data.chapterId]
        );
      }
    }
  } catch (e) {
    console.error('Error updating recording data', e);
  }
};

export const createUpdateChapter = async (chapterData: Chapter) => {
  // console.log({ chapterData });
  if (!chapterData.podfic_id) {
    console.warn('No podfic for chapter! Please be creating a new podfic');
    return;
  }

  // TODO: how to make it null as needed?
  if (chapterData.length)
    chapterData.length = getLengthUpdateString(chapterData.length);
  let prevChapterStatus = null;
  if (
    !!chapterData.posted_date &&
    chapterData.status !== PodficStatus.POSTED &&
    chapterData.status !== PodficStatus.FINISHED
  ) {
    prevChapterStatus = chapterData.status;
    chapterData.status = PodficStatus.POSTED;
  }

  const client = await getClient();
  // TODO: possibly handle things not updating from here?
  if (!chapterData.chapter_id) {
    // TODO: any processing on the length fields?
    // TODO: should it just be ?? null?
    const result = await client.query(
      `
      INSERT INTO chapter (
        podfic_id,
        link,
        chapter_number,
        chapter_title,
        wordcount,
        length,
        status,
        ao3_link,
        posted_date,
        deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING chapter_id
      `,
      [
        chapterData.podfic_id,
        chapterData.link,
        chapterData.chapter_number,
        chapterData.chapter_title,
        chapterData.wordcount,
        chapterData.length,
        chapterData.status,
        chapterData.ao3_link,
        chapterData.posted_date ? chapterData.posted_date : null,
        chapterData.deadline ? chapterData.deadline : null,
      ]
    );
    // console.log(result);
    return result.rows[0];
  } else {
    if (!prevChapterStatus) {
      prevChapterStatus = (
        await client.query(`SELECT status FROM chapter WHERE chapter_id = $1`, [
          chapterData.chapter_id,
        ])
      ).rows[0].status;
    }

    // if updating to posted do that separately from length bc I think that's what's breaking the auto updates?
    if (
      chapterData.status === PodficStatus.POSTED &&
      prevChapterStatus !== PodficStatus.POSTED &&
      !!chapterData.posted_date
    ) {
      await client.query(
        `
        UPDATE chapter SET
        posted_date = $1
        WHERE chapter_id = $2
      `,
        [chapterData.posted_date, chapterData.chapter_id]
      );
    }

    const result = await client.query(
      `UPDATE chapter SET
      link = $1,
      chapter_number = $2,
      chapter_title = $3,
      wordcount = $4,
      length = $5,
      status = $6,
      ao3_link = $7,
      posted_date = $8,
      deadline = $9
    WHERE chapter_id = $10
    RETURNING *
    `,
      [
        chapterData.link,
        chapterData.chapter_number,
        chapterData.chapter_title,
        chapterData.wordcount,
        chapterData.length,
        chapterData.status,
        chapterData.ao3_link,
        chapterData.posted_date ? chapterData.posted_date : null,
        chapterData.deadline ? chapterData.deadline : null,
        chapterData.chapter_id,
      ]
    );
    return result.rows[0];
  }
};

export const setChapterPosted = async (chapterId: number) => {
  const client = await getClient();
  const result = await client.query(
    `UPDATE chapter SET status = $1 WHERE chapter_id = $2 RETURNING *`,
    [PodficStatus.POSTED, chapterId]
  );
  return result.rows[0];
};

export const createUpdateChapterClient = async (chapterData: Chapter) => {
  await createUpdateChapter(chapterData);
};

export const createUpdateWork = async (
  workData: Podfic & Work
): Promise<Work | null> => {
  if (!workData.work_id) {
    console.warn('Creating new work');
  }

  let workResult = null;

  const client = await getClient();
  if (!workData.work_id) {
    // console.log('creating new work');
    workResult = await client.query(
      `INSERT INTO work (
      title,
      nickname,
      link,
      author_id,
      fandom_id,
      needs_update,
      wordcount,
      chaptered,
      chapter_count,
      rating
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    )
    RETURNING *
    `,
      [
        workData.title,
        workData.nickname,
        workData.link,
        workData.author_id,
        workData.fandom_id,
        workData.needs_update,
        workData.wordcount,
        workData.chaptered,
        workData.chapter_count,
        workData.rating,
      ]
    );
  } else {
    // console.log('updating work');
    workResult = await client.query(
      `UPDATE work SET
      title = $1,
      link = $2,
      author_id = $3,
      fandom_id = $4,
      needs_update = $5,
      wordcount = $6,
      chaptered = $7,
      chapter_count = $8,
      rating = $9,
      nickname = $10
    WHERE work_id = $11
    RETURNING *`,
      [
        workData.title,
        workData.link,
        workData.author_id,
        workData.fandom_id,
        workData.needs_update,
        workData.wordcount,
        workData.chaptered,
        workData.chapter_count,
        workData.rating,
        workData.nickname,
        workData.work_id,
      ]
    );
  }

  return workResult?.rows[0] ?? null;
};

export const updatePodficMinified = async (data: any) => {
  const podficData = JSON.parse(data);
  // console.log({ podficData });

  if (podficData.length)
    podficData.length = getLengthUpdateString(podficData.length);

  const client = await getClient();
  const result = await client.query(
    `UPDATE podfic SET
      length = $1,
      posted_date = $2,
      ao3_link = $3,
      status = $4,
      updated_at = $5
    WHERE podfic_id = $6
    RETURNING *`,
    [
      podficData.length,
      podficData.posted_date,
      podficData.ao3_link,
      podficData.status,
      new Date(),
      podficData.podfic_id,
    ]
  );
  // console.log(result.rows[0]);

  // return result.rows[0];
};

export const createUpdatePodfic = async (
  podficData: Podfic & Work
): Promise<null | Podfic> => {
  if (!podficData.podfic_id) {
    console.warn('No existing podfic! Hopefully you are meaning to create');
  }

  let podficResult = null;

  // console.log(`length: ${podficData.length}`);
  if (podficData.length)
    podficData.length = getLengthUpdateString(podficData.length);

  console.log({ podficcers: podficData.podficcers });

  const client = await getClient();
  if (!podficData.podfic_id) {
    if (podficData.work_id) {
      // console.log('linking new podfic to existing work');
      // TODO: figure out if work needs to be updated
      await createUpdateWork(podficData);

      podficResult = await client.query(
        `INSERT INTO podfic (work_id, status, is_private, length, event_id, ao3_link, posted_date, exclude_stats, type, giftee_id, deadline, added_date, posted_year, vt_project_id, series_id, posted_unchaptered, updated_at) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17
      )
      RETURNING *
    `,
        [
          podficData.work_id,
          podficData.status,
          podficData.is_private,
          podficData.length,
          podficData.event_id,
          podficData.ao3_link,
          podficData.posted_date ? podficData.posted_date : null,
          podficData.exclude_stats,
          podficData.type ?? 'podfic',
          podficData.giftee_id,
          podficData.deadline,
          podficData.added_date,
          podficData.posted_year,
          podficData.vt_project_id,
          podficData.series_id,
          podficData.posted_unchaptered,
          new Date(),
        ]
      );
    } else {
      // console.log('creating new podfic and work');
      const work_id = (await createUpdateWork(podficData)).work_id;

      podficResult = await client.query(
        `INSERT INTO podfic (work_id, status, is_private, length, event_id, ao3_link, posted_date, exclude_stats, type, giftee_id, deadline, added_date, posted_year, vt_project_id, series_id, posted_unchaptered, updated_at) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16,
        $17
      )
      RETURNING *
    `,
        [
          work_id,
          podficData.status ?? PodficStatus.PLANNING,
          podficData.is_private,
          podficData.length,
          podficData.event_id,
          podficData.ao3_link,
          podficData.posted_date ? podficData.posted_date : null,
          podficData.exclude_stats,
          podficData.type ?? 'podfic',
          podficData.giftee_id,
          podficData.deadline,
          podficData.added_date,
          podficData.posted_year,
          podficData.vt_project_id,
          podficData.series_id,
          podficData.posted_unchaptered,
          new Date(),
        ]
      );
      const podfic_id = podficResult.rows[0].podfic_id;
      podficData.podfic_id = podfic_id;

      if (podficData.chapters?.length)
        for (const chapter of podficData.chapters) {
          const chapter_id = (
            await createUpdateChapter({ ...chapter, podfic_id: podfic_id })
          ).chapter_id;
          chapter.chapter_id = chapter_id;
        }
    }
  } else {
    // console.log('updating existing podfic');
    await createUpdateWork(podficData);
    podficResult = await client.query(
      `UPDATE podfic SET
      work_id = $1,
      status = $2,
      is_private = $3,
      length = $4,
      event_id = $5,
      ao3_link = $6,
      posted_date = $7,
      exclude_stats = $8,
      type = $9,
      giftee_id = $10,
      deadline = $11,
      added_date = $12,
      posted_year = $13,
      vt_project_id = $14,
      series_id = $15,
      posted_unchaptered = $16,
      updated_at = $17
    WHERE podfic_id = $18
    RETURNING *
    `,
      [
        podficData.work_id,
        podficData.status,
        podficData.is_private,
        podficData.length,
        podficData.event_id,
        podficData.ao3_link,
        podficData.posted_date ? podficData.posted_date : null,
        podficData.exclude_stats,
        podficData.type,
        podficData.giftee_id,
        podficData.deadline,
        new Date(podficData.added_date),
        podficData.posted_year,
        podficData.vt_project_id,
        podficData.series_id,
        podficData.posted_unchaptered,
        new Date(),
        podficData.podfic_id,
      ]
    );
  }
  const podficId = podficResult?.rows[0].podfic_id;
  if (podficData.podficcers) {
    for (const podficcer of podficData.podficcers ?? []) {
      await linkPodficcerToPodfic(podficcer.podficcer_id, podficId);
    }
  }
  return podficResult?.rows[0];
};

export const createUpdatePodficClient = async (podficData: Podfic & Work) => {
  await createUpdatePodfic(podficData);
};

export const createUpdatePodficHTML = async (podficId, htmlString) => {
  const client = await getClient();

  // return result?
  await client.query(
    `UPDATE podfic SET html_string = $1 WHERE podfic_id = $2`,
    [htmlString, podficId]
  );
};

export const createUpdateChapterHTML = async (chapterId, htmlString) => {
  const client = await getClient();

  await client.query(
    `UPDATE chapter SET html_string = $1 where chapter_id = $2`,
    [htmlString, chapterId]
  );
};

export const createUpdateFandomCategory = async (categoryData) => {
  const client = await getClient();
  // TODO: handle updating categories?
  const result = await client.query(
    `insert into fandom_category (name) values ($1) returning *`,
    [categoryData.category_name]
  );

  return result.rows[0];
};

export const createUpdateFandom = async (fandomData): Promise<any> => {
  if (!!fandomData.fandom_id) {
    console.error('Error: updating fandoms is not currently supported!');
    return;
  }

  if (!fandomData.category_id) {
    fandomData.category_id = (
      await createUpdateFandomCategory(fandomData)
    ).fandom_category_id;
  }

  const client = await getClient();
  const result = await client.query(
    `insert into fandom (category_id, name) values ($1, $2) returning *`,
    [fandomData.category_id, fandomData.fandom_name]
  );
  return result.rows[0];
};

export const createUpdateAuthorClient = async (authorData): Promise<any> => {
  await createUpdateAuthor(authorData);
};

export const createUpdateAuthor = async (authorData): Promise<any> => {
  let authorResult = null;

  const client = await getClient();
  if (!authorData.author_id) {
    authorResult = await client.query(
      `
      insert into author (username, ao3, permission_status, primary_social_media, permission_ask, podficcer_id, asked_date, permission_date) values ($1, $2, $3, $4, $5, $6, $7, $8) returning *
    `,
      [
        authorData.username,
        authorData.ao3,
        authorData.permission_status,
        authorData.primary_social_media,
        authorData.permission_ask,
        authorData.podficcer_id,
        authorData.asked_date,
        authorData.permission_date,
      ]
    );
  } else {
    const author_id = authorData.author_id;
    delete authorData.author_id;
    authorResult = await client.query(
      `
      update author set username = $1, ao3 = $2, permission_status = $3, primary_social_media = $4, permission_ask = $5, podficcer_id = $6, asked_date = $7, permission_date = $8 where author_id = $9 returning *
    `,
      [
        authorData.username,
        authorData.ao3,
        authorData.permission_status,
        authorData.primary_social_media,
        authorData.permission_ask,
        authorData.podficcer_id,
        authorData.asked_date,
        authorData.permission_date,
        author_id,
      ]
    );
  }

  return authorResult?.rows[0];
};

export const createUpdateResource = async ({
  resourceData,
  podfic_id,
  chapter_id,
  author_id,
  event_id,
}: {
  resourceData: Resource;
  podfic_id?: number;
  chapter_id?: number;
  author_id?: number;
  event_id?: number;
}) => {
  let resourceResult = null;

  // console.log({ resourceData });

  const client = await getClient();
  if (!resourceData.resource_id) {
    // nah its prob fine nvm
    // if (!podficId && !chapterId && !authorId && !eventId) {
    //   throw new Error('Cannot create an unlinked resource!');
    // }
    const result = await client.query(
      `
      INSERT INTO resource (resource_type, label, link, notes) VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [
        resourceData.resource_type,
        resourceData.label,
        resourceData.link,
        resourceData.notes,
      ]
    );
    resourceResult = result.rows[0];
    const resourceId = resourceResult.resource_id;

    if (podfic_id) {
      await joinResourcePodfic(resourceId, podfic_id, client);
    }
    if (chapter_id) {
      await joinResourceChapter(resourceId, chapter_id, podfic_id, client);
    }
    if (author_id) {
      await joinResourceAuthor(resourceId, author_id, client);
    }
    if (event_id) {
      await joinResourceEvent(resourceId, event_id, client);
    }
  } else {
    const resourceId = resourceData.resource_id;
    const result = await client.query(
      `UPDATE resource SET
      resource_type = $1,
      label = $2,
      link = $3,
      notes = $4
    WHERE resource_id = $5
    RETURNING *
    `,
      [
        resourceData.resource_type,
        resourceData.label,
        resourceData.link,
        resourceData.notes,
        resourceData.resource_id,
      ]
    );
    resourceResult = result.rows[0];

    // TODO: linking
    if (podfic_id) {
      const podficJoinResult = await client.query(
        `select * from resource_podfic where resource_id = $1 and podfic_id = $2`,
        [resourceId, podfic_id]
      );
      // console.log({ podficJoinResult });
      if (!podficJoinResult.rows?.length) {
        await joinResourcePodfic(resourceId, podfic_id, client);
      }
    }
    if (chapter_id) {
      const chapterJoinResult = await client.query(
        `select * from resource_chapter where resource_id = $1 and chapter_id = $2`,
        [resourceId, chapter_id]
      );
      // console.log({ chapterJoinResult });
      if (!chapterJoinResult.rows?.length) {
        await joinResourceChapter(resourceId, chapter_id, podfic_id, client);
      }
    }
    if (author_id) {
      const authorJoinResult = await client.query(
        `select * from resource_author where resource_id = $1 and author_id = $2`,
        [resourceId, author_id]
      );
      // console.log({ authorJoinResult });
      if (!authorJoinResult.rows?.length) {
        await joinResourceAuthor(resourceId, author_id, client);
      }
    }
    // TODO: author & event (check functionality first)
    if (event_id) {
      const eventJoinResult = await client.query(
        `select * from resource_event where resource_id = $1 and event_id = $2`,
        [resourceId, event_id]
      );
      // console.log({ eventJoinResult });
      if (!eventJoinResult.rows?.length) {
        await joinResourceEvent(resourceId, event_id, client);
      }
    }
  }

  return resourceResult.resource_id;
};

export const createUpdateFile = async (fileData): Promise<any> => {
  let fileResult = null;

  // console.log({ fileData });
  fileData.length = getLengthUpdateString(fileData.length);
  const client = await getClient();
  if (!fileData.file_id) {
    const result = await client.query(
      `INSERT INTO file (
      podfic_id, chapter_id, length, size, filetype, label, is_plain
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        fileData.podficId,
        fileData.chapterId,
        fileData.length,
        fileData.size,
        fileData.filetype,
        fileData.label,
        fileData.isPlain,
      ]
    );

    fileResult = result.rows[0];
  } else {
    const result = await client.query(
      `
      UPDATE file SET
        length = $1,
        size = $2,
        filetype = $3,
        label = $4,
        is_plain = $5
      WHERE file_id = $6
      RETURNING *
    `,
      [
        fileData.length,
        fileData.size,
        fileData.filetype,
        fileData.label,
        fileData.isPlain,
        fileData.file_id,
      ]
    );
    fileResult = result.rows[0];
  }
  // console.log({ fileResult });
  const fileId = fileResult.file_id;

  // TODO: also put these in the return data?
  if (fileData.links) {
    for (const fileLink of fileData.links) {
      await createUpdateFileLink({ ...fileLink, file_id: fileId });
    }
  }

  return fileResult.file_id;
};

export const createUpdateFileLink = async (fileLinkData): Promise<any> => {
  let fileLinkResult = null;

  const client = await getClient();
  // console.log({ fileLinkData });
  if (!fileLinkData.file_link_id) {
    const result = await client.query(
      `INSERT INTO file_link
      (file_id, host, link, is_direct, is_embed) VALUES ($1, $2, $3, $4, $5) RETURNING *
      `,
      [
        fileLinkData.file_id,
        fileLinkData.host,
        fileLinkData.link,
        fileLinkData.is_direct,
        fileLinkData.is_embed,
      ]
    );
    fileLinkResult = result.rows[0];
  } else {
    const result = await client.query(
      `
      UPDATE file_link SET
        file_id = $1,
        host = $2,
        link = $3,
        is_direct = $4,
        is_embed = $5
      WHERE file_link_id = $6
      RETURNING *
      `,
      [
        fileLinkData.file_id,
        fileLinkData.host,
        fileLinkData.link,
        fileLinkData.is_direct,
        fileLinkData.is_embed,
        fileLinkData.file_link_id,
      ]
    );
    fileLinkResult = result.rows[0];
  }

  return fileLinkResult;
};

export const createUpdateNote = async (noteData: Note): Promise<any> => {
  let noteResult = null;

  const client = await getClient();
  if (!noteData.note_id) {
    const result = await client.query(
      `
      INSERT INTO note
      (podfic_id, chapter_id, author_id, event_id, label, value)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [
        noteData.podfic_id,
        noteData.chapter_id,
        noteData.author_id,
        noteData.event_id,
        noteData.label,
        noteData.value,
      ]
    );
    noteResult = result.rows;
  } else {
    const result = await client.query(
      `
      UPDATE note SET
        podfic_id = $1,
        chapter_id = $2,
        author_id = $3,
        event_id = $4,
        label = $5,
        value = $6
      WHERE note_id = $7
      RETURNING *
    `,
      [
        noteData.podfic_id,
        noteData.chapter_id,
        noteData.author_id,
        noteData.event_id,
        noteData.label,
        noteData.value,
        noteData.note_id,
      ]
    );

    noteResult = result.rows;
  }

  return noteResult;
};

const joinResourcePodfic = async (resourceId, podficId, client) => {
  const joinResult = await client.query(
    `INSERT INTO resource_podfic (resource_id, podfic_id) VALUES ($1, $2)`,
    [resourceId, podficId]
  );
};

// includes podfic id for easier grabbing by podfic.
// is it necessary? nah but who cares tbh
const joinResourceChapter = async (resourceId, chapterId, podficId, client) => {
  const joinResult = await client.query(
    `INSERT INTO resource_chapter (resource_id, chapter_id, podfic_id) VALUES ($1, $2, $3)`,
    [resourceId, chapterId, podficId]
  );
};

const joinResourceAuthor = async (resourceId, authorId, client) => {
  const joinResult = await client.query(
    `INSERT INTO resource_author (resource_id, author_id) VALUES ($1, $2)`,
    [resourceId, authorId]
  );
};

const joinResourceEvent = async (resourceId, eventId, client) => {
  const joinResult = await client.query(
    `INSERT INTO resource_event (resource_id, event_id) VALUES ($1, $2)`,
    [resourceId, eventId]
  );
};

export const createUpdateEvent = async (eventData: Event): Promise<Event> => {
  if (!eventData.parent_id) {
    throw new Error('Event needs parent!');
  }

  let eventResult = null;

  const client = await getClient();
  if (!eventData.event_id) {
    const result = await client.query(
      `INSERT INTO event (parent_id, name, year) VALUES ($1, $2, $3) RETURNING *`,
      [eventData.parent_id, eventData.name, eventData.year]
    );
    eventResult = result.rows[0];
  } else {
    const result = await client.query(
      `UPDATE event SET
        parent_id = $1,
        name = $2,
        year = $3
      RETURNING *`,
      [eventData.parent_id, eventData.name, eventData.year]
    );
    eventResult = result.rows[0];
  }

  return eventResult;
};

export const createUpdateEventParent = async (
  eventParentData: EventParent
): Promise<number> => {
  // TODO: implement updating
  if (!!eventParentData.event_parent_id) {
    throw new Error('Cannot update event parents yet!');
  }

  const client = await getClient();
  const result = await client.query(
    `INSERT INTO event_parent (name, description) VALUES ($1, $2) RETURNING *`,
    [eventParentData.name, eventParentData.description]
  );

  return result.rows[0].event_parent_id;
};

export const createUpdateCoverArt = async (coverArtData: any) => {
  if (!coverArtData.podfic_id) {
    throw new Error('Cannot create cover art without associated podfic');
  }

  let coverArtResult = null;

  const client = await getClient();

  if (!coverArtData.cover_art_id) {
    const result = await client.query(
      `
      INSERT INTO cover_art (podfic_id, cover_artist_name, podficcer_id, image_link, status) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
      [
        coverArtData.podfic_id,
        coverArtData.cover_artist_name,
        coverArtData.podficcer_id,
        coverArtData.image_link,
        coverArtData.cover_art_status,
      ]
    );
    coverArtResult = result.rows[0];
  } else {
    const result = await client.query(
      `UPDATE cover_art SET
      podfic_id = $1,
      cover_artist_name = $2,
      podficcer_id = $3,
      image_link = $4,
      status = $5
    WHERE cover_art_id = $6
    RETURNING *`,
      [
        coverArtData.podfic_id,
        coverArtData.cover_artist_name,
        coverArtData.podficcer_id,
        coverArtData.image_link,
        coverArtData.cover_art_status,
        coverArtData.cover_art_id,
      ]
    );
    coverArtResult = result.rows[0];
  }

  return coverArtResult.cover_art_id;
};

export const createUpdatePodficcer = async (podficcerData: Podficcer) => {
  let podficcerResult = null;

  const client = await getClient();
  if (!podficcerData.podficcer_id) {
    const result = await client.query(
      `INSERT INTO podficcer (username, name, profile) VALUES ($1, $2, $3) RETURNING *`,
      [podficcerData.username, podficcerData.name, podficcerData.profile]
    );
    podficcerResult = result.rows[0];
  } else {
    const result = await client.query(
      `UPDATE podficcer SET
      username = $1,
      name = $2,
      profile = $3
    WHERE podficcer_id = $4
    RETURNING *`,
      [
        podficcerData.username,
        podficcerData.name,
        podficcerData.profile,
        podficcerData.podficcer_id,
      ]
    );
    podficcerResult = result.rows[0];
  }

  return podficcerResult;
};

export const createUpdateSeries = async (seriesData) => {
  let seriesResult = null;

  const client = await getClient();
  if (!seriesData.series_id) {
    const result = await client.query(
      `
      INSERT INTO series (name, series_link) VALUES ($1, $2) RETURNING *
    `,
      [seriesData.name, seriesData.series_link]
    );
    seriesResult = result.rows[0];
  } else {
    const result = await client.query(
      `
      UPDATE series SET
        name = $1,
        series_link = $2
      WHERE series_id = $3
    `,
      [seriesData.name, seriesData.series_link, seriesData.series_id]
    );
    seriesResult = result.rows[0];
  }

  return seriesResult.series_id;
};

export const createUpdateVoiceteamEvent = async () => {
  return;
};

export const createUpdateRound = async (roundData: Round) => {
  const client = await getClient();

  let roundResult = null;

  if (!roundData.round_id) {
    const result = await client.query(
      `INSERT INTO round (
        voiceteam_event_id,
        name,
        number,
        points_break,
        deadline
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING *`,
      [
        roundData.voiceteam_event_id,
        roundData.name,
        roundData.number,
        roundData.points_break,
        roundData.deadline,
      ]
    );
    roundResult = result.rows[0];
  } else {
    const result = await client.query(
      `UPDATE round SET
        name = $1,
        number = $2,
        points_break = $3,
        deadline = $4
      WHERE round_id = $5
      RETURNING *`,
      [
        roundData.name,
        roundData.number,
        roundData.points_break,
        roundData.deadline,
        roundData.round_id,
      ]
    );
    roundResult = result.rows[0];
  }

  return roundResult.round_id;
};

export const createUpdateChallenge = async (challengeData: Challenge) => {
  if (!challengeData.round_id) {
    throw new Error('Cannot create a challenge without a round!');
  }

  const client = await getClient();
  if (!challengeData.challenge_id) {
    const result = await client.query(
      `INSERT INTO challenge
        (round_id, name, description, points, bonus_points, bonus_is_additional, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        challengeData.round_id,
        challengeData.name,
        challengeData.description,
        challengeData.points,
        challengeData.bonus_points,
        challengeData.bonus_is_additional,
        challengeData.created_at,
      ]
    );
  } else {
    console.log({ challengeData });
    const result = await client.query(
      `UPDATE challenge SET
        name = $1,
        description = $2,
        points = $3,
        bonus_points = $4,
        bonus_is_additional = $5
      WHERE challenge_id = $6
      RETURNING *`,
      [
        challengeData.name,
        challengeData.description,
        challengeData.points,
        challengeData.bonus_points,
        challengeData.bonus_is_additional,
        challengeData.challenge_id,
      ]
    );
    // console.log({ result });
  }
};

export const createUpdateProject = async (projectData: Project) => {
  let projectResult = null;

  const client = await getClient();
  if (!projectData.vt_project_id) {
    // TODO: insert the other things as well......
    const result = await client.query(
      `INSERT INTO vt_project (challenge_id, name, notes, link, bonus, bonus_manual, points_manual, universal_bonus, project_lead_bonus, byo_bonus, length, length_bonus, finished, submitted, abandoned, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        projectData.challenge_id,
        projectData.name,
        projectData.notes,
        projectData.link,
        projectData.bonus,
        projectData.bonus_manual,
        projectData.points_manual,
        projectData.universal_bonus,
        projectData.project_lead_bonus,
        projectData.byo_bonus,
        projectData.length,
        projectData.length_bonus,
        projectData.finished,
        projectData.submitted,
        projectData.abandoned,
        projectData.created_at,
      ]
    );
    projectResult = result.rows[0];
  } else {
    const result = await client.query(
      `UPDATE vt_project SET
        challenge_id = $1,
        name = $2,
        notes = $3,
        link = $4,
        bonus = $5,
        bonus_manual = $6,
        points_manual = $7,
        universal_bonus = $8,
        project_lead_bonus = $9,
        byo_bonus = $10,
        length = $11,
        length_bonus = $12,
        finished = $13,
        submitted = $14,
        abandoned = $15
      WHERE vt_project_id = $16
      RETURNING *`,
      [
        projectData.challenge_id,
        projectData.name,
        projectData.notes,
        projectData.link,
        projectData.bonus,
        projectData.bonus_manual,
        projectData.points_manual,
        projectData.universal_bonus,
        projectData.project_lead_bonus,
        projectData.byo_bonus,
        projectData.length,
        projectData.length_bonus,
        projectData.finished,
        projectData.submitted,
        projectData.abandoned,
        projectData.vt_project_id,
      ]
    );
    projectResult = result.rows[0];
  }

  // return projectResult;
};

export const saveChapterHTML = async (chapterId, htmlString) => {
  const client = await getClient();

  await client.query(
    `UPDATE chapter SET html_string = $1 WHERE chapter_id = $2`,
    [htmlString, chapterId]
  );
};

export const savePodficHTML = async (podficId, htmlString) => {
  const client = await getClient();

  await client.query(
    `UPDATE podfic SET html_string = $1 WHERE podfic_id = $2`,
    [htmlString, podficId]
  );
};

export const createUpdateScheduleEvents = async (events) => {
  const client = await getClient();

  // TODO: do them all at once??
  for (const event of events) {
    if (!event.id) {
      await client.query(
        `INSERT INTO schedule_event
          (podfic_id, chapter_id, title, start, end, allday)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
        [
          event.podfic_id,
          event.chapter_id,
          event.title,
          event.start,
          event.end,
          event.allday,
        ]
      );
    } else {
      await client.query(
        `UPDATE schedule_event
        SET
          podfic_id = $1,
          chapter_id = $2,
          title = $3,
          start = $4,
          end = $5,
          allday = $6
        WHERE schedule_event_id = $7
        RETURNING *
      `,
        [
          event.podfic_id,
          event.chapter_id,
          event.title,
          event.start,
          event.end,
          event.allday,
          event.schedule_event_id,
        ]
      );
    }
  }
};

export const createUpdateScheduleEvent = async (event) => {
  const client = await getClient();

  // console.log({ event });

  if (!event.schedule_event_id) {
    const result = await client.query(
      `INSERT INTO schedule_event
          (podfic_id, chapter_id, title, start, "end", allday)
        VALUES
          ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        event.podfic_id,
        event.chapter_id,
        event.title,
        event.start,
        event.end,
        event.allday,
      ]
    );
    return result.rows[0].schedule_event_id;
  } else {
    // console.log('updating event');
    const result = await client.query(
      `UPDATE schedule_event
        SET
          podfic_id = $1,
          chapter_id = $2,
          title = $3,
          start = $4,
          "end" = $5,
          allday = $6
        WHERE schedule_event_id = $7
        RETURNING *
      `,
      [
        event.podfic_id,
        event.chapter_id,
        event.title,
        event.start,
        event.end,
        event.allday,
        event.schedule_event_id,
      ]
    );
    return result.rows[0].schedule_event_id;
  }
};

export const createUpdatePartData = async (partData) => {
  // console.log({ partData });

  try {
    const client = await getClient();

    if (partData.podficData) {
      const podfic = await createUpdatePodfic(partData.podficData);
      partData.podfic_id = podfic.podfic_id;
    }

    if (!partData.part_id) {
      const result = await client.query(
        `insert into part (podfic_id, chapter_id, doc, organizer, words, status, part, deadline, created_at) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning *`,
        [
          partData.podfic_id,
          partData.chapter_id,
          partData.doc,
          partData.organizer,
          partData.words,
          partData.status,
          partData.part,
          partData.deadline,
          new Date(),
        ]
      );
    } else {
      if (typeof partData.part_id !== 'number')
        partData.part_id = parseInt(partData.part_id);
      const result = await client.query(
        `update part set
          podfic_id = $1,
          chapter_id = $2,
          doc = $3,
          organizer = $4,
          words = $5,
          status = $6,
          part = $7,
          deadline = $8
        where part_id = $9
        returning *
      `,
        [
          partData.podfic_id,
          partData.chapter_id,
          partData.doc,
          partData.organizer,
          partData.words,
          partData.status,
          partData.part,
          partData.deadline ? partData.deadline : null,
          partData.part_id,
        ]
      );
    }
  } catch (e) {
    throw new Error(e);
  }
};

export const updatePartMinified = async (data: any) => {
  const partData = JSON.parse(data);
  console.log({ partData });

  if (partData.length) partData.length = getLengthUpdateString(partData.length);

  console.log({ partData });

  if (typeof partData.part_id !== 'number')
    partData.part_id = parseInt(partData.part_id);

  const client = await getClient();
  const updateString = `UPDATE part SET
      doc = $1,
      audio_link = $2,
      part = $3,
      words = $4,
      type = $5,
      length = $6,
      status = $7
    WHERE part_id = $8
    RETURNING *`;
  const parameterArray = [
    partData.doc,
    partData.audio_link ? partData.audio_link : null,
    partData.part,
    partData.words,
    partData.type ? partData.type : null,
    partData.length,
    partData.status,
    partData.part_id,
  ];
  console.log({ parameterArray });
  console.log(parameterArray.length);
  const result = await client.query(updateString, parameterArray);
  console.log(result.rows[0]);
};

export const linkPodficcerToPodfic = async (
  podficcerId: number,
  podficId: number
) => {
  const client = await getClient();
  const result = await client.query(
    `INSERT INTO podfic_podficcer (podfic_id, podficcer_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *`,
    [podficId, podficcerId]
  );
  // console.log(result.rows[0]);
  return result.rows[0];
};
