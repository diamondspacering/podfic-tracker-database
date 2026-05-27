'use server';
// this will probably need to be a client component at some point...

import { getEmptyLength } from '../types';
import { getDBClient } from './db-helpers';
import { addLengths, getLengthValue } from './lengthHelpers';

// TODO: revamp these a bit because there's something deeply wrong w/ your numbers
// TODO: also revamp these to work with sections that'll be extremely fun

const IS_CHAPTERED = `((chaptered is true and section_type != 'multiple-to-single') or section_type = 'single-to-multiple')`;
const CHECK_POSTED_CHAPTERED_SECTION = `
  inner join podfic on section.podfic_id = podfic.podfic_id
  inner join work on podfic.work_id = work.work_id
where section.status = 'Posted' and ${IS_CHAPTERED}
`;
const IS_NOT_CHAPTERED = `
  (chaptered is not true or section_type = 'multiple-to-single')
  and section_type != 'single-to-multiple'
`;
const IS_NOT_MULTIVOICE = `is_multivoice is not true`;
const IS_SELF_POSTED = `(is_multivoice is not true or self_posted is true)`;
const IS_POSTED = (includeUnposted: boolean, qualifier = '') => {
  const statusString = qualifier ? `${qualifier}.status` : 'status';
  return includeUnposted
    ? `(${statusString} = 'Posted' or ${statusString} = 'Finished')`
    : `${statusString} = 'Posted'`;
};

/**
 * Gets all podfics posted in a year, counting as generously as possible. This includes multivoices, unposted works marked "Finished" that have a posting date, and chaptered works (put under the year they were finished).
 * @returns {Promise< { [year: number]: number }>} Number of podfic per year
 */
export const getPodficCountByYear = async (): Promise<{
  [year: number]: number;
}> => {
  const client = await getDBClient();
  const dateResult = await client.query(
    `select date_part('year', posted_date) as year, count(posted_date) from podfic group by year;`,
  );

  const reduced = dateResult.rows.reduce((acc, cur) => {
    if (cur.year) acc[cur.year] = cur.count;
    return acc;
  }, {});
  return reduced;
};

/**
 * Fetch the total length by year of all solo podfics posted in one chunk
 */
export const getPostedPodficSingleWorkLengthByYear = async (): Promise<{
  [year: number]: Length;
}> => {
  const client = await getDBClient();
  const result = await client.query(`
    select sum(length), date_part('year', posted_date) as year from podfic 
      inner join work on podfic.work_id = work.work_id
    where
      status = 'Posted'
      and ${IS_NOT_CHAPTERED}
      and ${IS_NOT_MULTIVOICE}
    group by year;
  `);
  const podfics = result.rows;

  const reducedPodfics = podfics.reduce((acc, cur) => {
    if (cur.year) acc[cur.year] = cur.sum;
    return acc;
  }, {});
  return reducedPodfics;
};

// TODO: should this exclude multivoices? probably!
/**
 * Gets combined length of all posted sections by year. Includes multivoices
 */
export const getPostedLengthByYear = async (): Promise<{
  [year: number]: Length;
}> => {
  const client = await getDBClient();
  const result = await client.query(
    `select sum(length), date_part('year', posted_date) as year from section where status = 'Posted' and number > 0 group by year`,
  );
  const podfics = result.rows;

  const reducedPodfics = podfics.reduce((acc, cur) => {
    if (cur.year) acc[cur.year] = cur.sum;
    return acc;
  }, {});
  return reducedPodfics;
};

/**
 * Get total length of individual podfics, not chapters, posted in a year
 * Optionally includes multivoices posted by you
 */
// hmmm I don't know how to count "my" podfics i feel like I should only count the length of my parts?? idk man
export const getPodficLength = async (
  year,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<Length> => {
  const client = await getDBClient();
  const result = await client.query(
    `select sum(length) from podfic
      inner join work on podfic.work_id = work.work_id
    where
      ${IS_POSTED(includeUnposted)}
      and date_part('year', posted_date) = $1
      and ${IS_NOT_CHAPTERED}
      ${includeMultivoices ? `and ${IS_SELF_POSTED}` : `and ${IS_NOT_MULTIVOICE}`}
    `,
    [year],
  );
  return result.rows[0].sum;
};

/**
 * Get total length of chapters posted in a year
 */
export const getChapterLengthByYear = async () => {
  const client = await getDBClient();
  const result = await client.query(`
    select sum(section.length), date_part('year', posted_date) as year from section
      ${CHECK_POSTED_CHAPTERED_SECTION}
    group by year;
  `);
  return result.rows;
};

/**
 * Get total posted chapter length for a given year
 */
export const getChapterLength = async (year): Promise<Length> => {
  const client = await getDBClient();
  const result = await client.query(
    `
    select sum(section.length) from section
      ${CHECK_POSTED_CHAPTERED_SECTION}
      and date_part('year', section.posted_date) = $1
  `,
    [year],
  );
  return result.rows[0].sum;
};

/**
 * Getter for both individual podfics and chapters organized by year added together
 * NOTE: currently unused
 */
export const getPodficAndChapterLengthByYear = async () => {
  const reducedPodfics = await getPostedPodficSingleWorkLengthByYear();
  const chapters = await getChapterLengthByYear();

  // and then combine and return
  // console.log({ reducedPodfics });
  const reducedChapters = chapters.reduce((acc, cur) => {
    if (cur.year) {
      acc[cur.year] = cur.sum;
    }
    return acc;
  }, {});
  // console.log({ reducedChapters });

  const combined = Object.keys(reducedPodfics).reduce((acc, cur) => {
    acc[cur] = addLengths(
      reducedPodfics[cur] ?? getEmptyLength(),
      reducedChapters[cur] ?? getEmptyLength(),
    );
    return acc;
  }, {});
  // console.log({ combined });
  return combined;
};

/**
 * Get longest posted podfic, currently including multivoices
 * TODO: add params for like indiv podfic, etc.
 * @param [year] Year to get longest podfic for, leave blank for all time
 */
export const getLongestPodfic = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<{ length: Length }> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select length from podfic
      where
        ${IS_POSTED(includeUnposted, 'podfic')}
        and date_part('year', posted_date) = $1
        and length is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      order by length desc
      limit 1`,
      [year],
    );
    const sectionResult = await client.query(
      `select section.length from section
        ${CHECK_POSTED_CHAPTERED_SECTION}
        and date_part('year', section.posted_date) = $1
        and section.length is not null
      order by section.length desc
      limit 1`,
      [year],
    );
    // console.log({
    //   year,
    //   sectionResult: sectionResult.rows[0],
    //   result: result.rows[0],
    // });
    if (
      getLengthValue(sectionResult.rows[0]?.length) >
      getLengthValue(result.rows[0]?.length)
    ) {
      return sectionResult.rows[0];
    }
    return result.rows[0] ?? {};
  } else {
    // comparing longest podfic to longest section is also possible here, but I know my longest podfic is longer than any section I would do, so it's not needed
    const result = await client.query(
      `select length from podfic
      where ${IS_POSTED(includeUnposted, 'podfic')}
        and length is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      order by length desc
      limit 1`,
    );
    return result.rows[0] ?? {};
  }
};

/**
 * Gets longest individually posted podfic
 * @param [year] Year to get podfic for, leave blank for all time
 * @param [includeMultivoices] Include self-posted multivoices
 */
export const getLongestSingleWorkPodfic = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select length from podfic
        inner join work on podfic.work_id = work.work_id
      where
        ${IS_POSTED(includeUnposted, 'podfic')}
        and date_part('year', posted_date) = $1
        and length is not null
        and ${IS_NOT_CHAPTERED}
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      order by length desc
      limit 1`,
      [year],
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select length from podfic
      where
        ${IS_POSTED(includeUnposted, 'podfic')}
        and length is not null
        and ${IS_NOT_CHAPTERED}
      order by length desc limit 1`,
    );
    return result.rows[0] ?? {};
  }
};

/**
 * Gets longest posted chapter(/section posted as chapter) for a given year
 * @param [year] Year to get chapter for, leave blank for all time
 */
export const getLongestChapter = async (year = null) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select section.length from section
        ${CHECK_POSTED_CHAPTERED_SECTION}
        and date_part('year', section.posted_date) = $1
        and section.length is not null
      order by section.length desc limit 1`,
      [year],
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select section.length from section
        ${CHECK_POSTED_CHAPTERED_SECTION}
        and section.length is not null
      order by length desc limit 1`,
    );
    return result.rows[0] ?? {};
  }
};

/**
 * Returns shortest podfic, excluding multivoices
 * @param [year] Year to get shortest podfic in, leave empty for shortest of all time
 * @param [includeMultivoices] Whether to include self-posted multivoices
 * @returns Shortest length
 */
export const getShortestPodfic = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<{ length: Length }> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select length from podfic
      where
        ${IS_POSTED(includeUnposted)}
        and date_part('year', posted_date) = $1
        and length is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      order by length
      limit 1`,
      [year],
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select length from podfic
      where
        ${IS_POSTED(includeUnposted)}
        and length is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      order by length
      limit 1`,
    );
    return result.rows[0] ?? {};
  }
};

// TODO: this should exclude multivoice as well
/**
 * Get shortest posted chapter
 * @param [year] Year to get shortest for, leave blank for all time
 */
export const getShortestChapter = async (year = null) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select section.length from section
        ${CHECK_POSTED_CHAPTERED_SECTION}
        and section.length is not null
        and date_part('year', section.posted_date) = $1
      order by length
      limit 1`,
      [year],
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select section.length from section
        ${CHECK_POSTED_CHAPTERED_SECTION}
        and section.length is not null
      order by length
      limit 1`,
    );
    return result.rows[0] ?? {};
  }
};

/**
 * Gets average posted solo podfic length
 * Includes posted_year
 * @param [year] Year to get average length for, leave blank for all time
 * @param [includeMultivoices] Whether to include self-posted multivoices
 * @returns Length
 */
export const getAvgPodficLength = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<Length> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select avg(length) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        ${IS_POSTED(includeUnposted, 'podfic')}
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
        and date_part('year', posted_date) = $1
        and length is not null`,
      [year],
    );
    return result.rows[0].avg;
  } else {
    const result = await client.query(
      `select avg(length) from podfic
      where
        ${IS_POSTED(includeUnposted, 'podfic')}
        and length is not null
        and ${IS_NOT_MULTIVOICE}`,
    );
    return result.rows[0].avg;
  }
};

/**
 * Get average chapter length
 * @param [year] Year to get average for, leave blank for all time
 */
export const getAvgChapterLength = async (year = null): Promise<Length> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select avg(section.length) from section
        ${CHECK_POSTED_CHAPTERED_SECTION}
        and section.length is not null
        and date_part('year', section.posted_date) = $1
        and ${IS_NOT_MULTIVOICE}
      `,
      [year],
    );
    return result.rows[0].avg;
  } else {
    const result = await client.query(
      `select avg(section.length) from section
        ${CHECK_POSTED_CHAPTERED_SECTION}
      and section.length is not null
      and ${IS_NOT_MULTIVOICE}`,
    );
    return result.rows[0].avg;
  }
};

// TODO: allow counting multivoice part words as well - should work if we do sections where the podfic is posted
// TODO: i dont like this.
/**
 * Get wordcount for posted podfics (NOT in progress), excluding multivoices
 * @param [year] Year to get posted words for, leave blank for all time
 * @returns Number of words as string
 */
export const getPostedPodficWords = async (
  year = null,
): Promise<{ sum: string }> => {
  const client = await getDBClient();

  // TODO: shouldn't this be sections?
  if (year) {
    const result = await client.query(
      `select sum(wordcount) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        podfic.status = 'Posted'
        and date_part('year', posted_date) = $1
        and ${IS_NOT_MULTIVOICE}
        and wordcount is not null`,
      [year],
    );
    const sectionResult = await client.query(
      `select sum(section.wordcount) from section
        inner join podfic on section.podfic_id = podfic.podfic_id
        inner join work on podfic.work_id = work.work_id
      where
        podfic.status = 'Posted'
        and date_part('year', section.posted_date) = $1
        and section.wordcount is not null
        and section.number > 0
      `,
      [year],
    );
    const podficWordcount = result.rows[0] ?? {};
    const sectionWordcount = sectionResult.rows[0] ?? {};
    console.log(
      `posted words for ${year}: ${podficWordcount} in podfics only, ${sectionWordcount} in sections`,
    );
    return result.rows[0] ?? {};
  } else {
    // TODO: fix this, similar result w/ sections
    const result = await client.query(
      `select sum(wordcount) from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and ${IS_NOT_MULTIVOICE} and wordcount is not null`,
    );
    return result.rows[0] ?? {};
  }
};

/**
 * Get total wordcount of all posted sections
 * @param [year] Year to get words for, leave blank for all time
 * @returns Sum of all words as a number
 */
export const getAllPostedWords = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<number> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select sum(section.wordcount) from section
          inner join podfic on section.podfic_id = podfic.podfic_id
        where ${IS_POSTED(includeUnposted, 'section')}
          and number > 0
          and date_part('year', section.posted_date) = $1
          and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}`,
      [year],
    );
    return parseInt(result.rows[0].sum);
  } else {
    const result = await client.query(
      `select sum(wordcount) from section
          inner join podfic on section.podfic_id = podfic.podfic_id
        where ${IS_POSTED(includeUnposted, 'section')}
        and number > 0
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}`,
    );
    return parseInt(result.rows[0].sum);
  }
};

/**
 * Get posted individual podfic words for a given year
 */
export const getPostedSinglePodficWords = async (
  year: number | string,
  includeMultivoices = false,
  includeUnposted = false,
) => {
  const client = await getDBClient();

  const result = await client.query(
    `select sum(wordcount) from podfic
      inner join work on podfic.work_id = work.work_id
    where
      ${IS_POSTED(includeUnposted)}
      and date_part('year', posted_date) = $1
      and ${IS_NOT_CHAPTERED}
      and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      and wordcount is not null`,
    [year],
  );
  return parseInt(result.rows[0].sum);
};

/**
 * Get posted chapter words for a given year
 */
export const getPostedChapterWords = async (year) => {
  const client = await getDBClient();

  const result = await client.query(
    `select sum(section.wordcount) from section ${CHECK_POSTED_CHAPTERED_SECTION} and ${IS_NOT_MULTIVOICE} and date_part('year', section.posted_date) = $1 and section.wordcount is not null`,
    [year],
  );
  return parseInt(result.rows[0].sum);
};

/**
 * Gets total words in multivoice parts, either that were posted in a year or all time regardless of status
 * @param [year] Year for multivoice sections, leave blank for all time
 */
export const getMultivoiceWords = async (
  year = null,
): Promise<{ sum: number }> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `
      select sum(section.wordcount) from section
        where section.part_id is not null
        and date_part('year', section.posted_date) = $1
        and section.wordcount is not null  
    `,
      [year],
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(`
      select sum(section.wordcount) from section
        where section.part_id is not null
        and section.wordcount is not null
    `);
    return result.rows[0] ?? {};
  }
};

/**
 * Get average wordcount for posted solo podfics
 * @param [year] Year to get average for, leave blank for all time
 * @returns
 */
export const getAvgPostedWords = async (
  year = null,
): Promise<{ avg: number }> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select avg(wordcount) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        podfic.status = 'Posted'
        and date_part('year', posted_date) = $1
        and ${IS_NOT_MULTIVOICE}
        and wordcount is not null`,
      [year],
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select avg(wordcount) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        podfic.status = 'Posted'
        and ${IS_NOT_MULTIVOICE}
        and wordcount is not null`,
    );
    return result.rows[0] ?? {};
  }
};

export const getTotalPodficLength = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<Length> => {
  const client = await getDBClient();
  if (year) {
    const result = await client.query(
      `select sum(section.length) from section
          inner join podfic on podfic.podfic_id = section.podfic_id
        where
          ${includeMultivoices ? `${IS_SELF_POSTED}` : `${IS_NOT_MULTIVOICE}`}
          and ${IS_POSTED(includeUnposted, 'section')}
          and date_part('year', section.posted_date) = $1
          and number > 0`,
      [year],
    );
    const length = result.rows[0].sum;
    return length;
  } else {
    const result = await client.query(
      `select sum(length) from section
        where ${IS_POSTED(includeUnposted)}
        and number > 0`,
    );
    // console.log(result.rows);
    return result.rows[0].sum;
  }
};

/**
 * Get total length of all posted podfic sections, including multivoices
 * TODO: this could double-count length if you have parts on a multivoice as well as the full thing posted. we. uh. we need a way to fix this,
 * (would require pulling in self_posted I think - exclude parts for self_posted)
 * consider using more submitted/posted diff for multivoice parts? eh
 * @param [year] Year to get total from, leave blank for all time
 * @returns Total length
 */
export const getTotalPodficLengthOld = async (year = null): Promise<Length> => {
  const client = await getDBClient();
  if (year) {
    const result = await client.query(
      `select sum(length) from section
        where status = 'Posted'
        and date_part('year', posted_date) = $1
        and number > 0`,
      [year],
    );
    return result.rows[0].sum;
  } else {
    const result = await client.query(
      `select sum(length) from section
        where status = 'Posted'
        and number > 0`,
    );
    return result.rows[0].sum;
  }
};

/**
 * Get total raw length from all recording sessions
 * @param [year] Year to get total from, leave blank for all time
 * @returns {Length} Total length
 */
export const getTotalRawLength = async (year = null): Promise<Length> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select sum(length) from recording_session
        where date_part('year', date) = $1
        or year = $1`,
      [year],
    );
    return result.rows[0].sum;
  } else {
    const result = await client.query(
      `select sum(length) from recording_session`,
    );
    return result.rows[0].sum;
  }
};

/**
 * Returns number of all posted solo podfics
 */
export const getSoloCount = async (): Promise<number> => {
  const client = await getDBClient();

  const result = await client.query(
    `select count(*) from podfic where ${IS_NOT_MULTIVOICE} and status = 'Posted'`,
  );
  return result.rows[0].count;
};

export const getRawWordcount = async (year = null) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `
    select sum(wordcount) as wordcount, sum(recording_session.length) as length from section
      left join recording_session on section.section_id = recording_session.section_id
    where
      status is not null
      and status != 'Recording'
      and status != 'Planning'
      and (date_part('year', recording_session.date) = $1 or recording_session.year = $1);
    `,
      [year],
    );
    return {
      wordcount: parseInt(result.rows[0].wordcount ?? 0),
      length: result.rows[0].length,
    };
  } else {
    return null;
  }
};

// -- Categories --

/**
 * Get top fandoms by length for posted podfic sections, excluding multivoices
 * @param [year] Year to get top fandoms for, leave blank for all time
 * @returns Ordered list with objects with `fandom_name` ane `fandom_len`, 10 for all time and 5 for per year
 */
export const getTopFandomsLen = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<{ name: string; len: Length }[]> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select fandom.name as name, sum(section.length) as len from section
        inner join podfic on section.podfic_id = podfic.podfic_id
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where
        ${IS_POSTED(includeUnposted, 'section')}
        and section.number > 0
        and work.fandom_id is not null
        and section.length is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
        and date_part('year', section.posted_date) = $1
      group by fandom.name
      order by len desc
      limit 5;
      `,
      [year],
    );
    const obj = result.rows.reduce((acc, cur) => {
      acc[cur.name] = cur.len;
      return acc;
    }, {});
    const list = Object.keys(obj).map((fandom) => ({
      name: fandom,
      len: obj[fandom],
    }));
    return list.sort((a, b) => getLengthValue(b.len) - getLengthValue(a.len));
  } else {
    const result = await client.query(
      `select fandom.name as name, sum(section.length) as len from section
        inner join podfic on section.podfic_id = podfic.podfic_id
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where
        ${IS_POSTED(includeUnposted, 'section')}
        and section.number > 0
        and work.fandom_id is not null
        and section.length is not null
        and ${IS_NOT_MULTIVOICE}
      group by fandom.name
      order by len desc
      limit 10;
      `,
    );
    const obj = result.rows.reduce((acc, cur) => {
      acc[cur.name] = cur.len;
      return acc;
    }, {});
    const list = Object.keys(obj).map((fandom) => ({
      name: fandom,
      len: obj[fandom],
    }));
    return list.sort((a, b) => getLengthValue(b.len) - getLengthValue(a.len));
  }
};

/**
 * Get top fandoms by count of works posted with them, excluding multivoices
 * @param [year] Year to get fandoms for, leave blank for all time
 * @returns Ordered list, 5 for per year and 10 for all time, with objects with `fandom_name` and `fandom_count`
 */
export const getTopFandomsCount = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<{ fandom_name: string; fandom_count: number }[]> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select fandom.name as name, count(*) as count from podfic
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where
        work.fandom_id is not null
        and ${IS_POSTED(includeUnposted, 'podfic')}
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
        and date_part('year', posted_date) = $1
      group by fandom.name
      order by count desc
      limit 5;`,
      [year],
    );
    return result.rows;
  } else {
    const result = await client.query(
      `select fandom.name as fandom_name, count(*) as fandom_count from podfic
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where
        work.fandom_id is not null
        and ${IS_POSTED(includeUnposted, 'podfic')}
        and ${IS_NOT_MULTIVOICE}
      group by fandom.name
      order by fandom_count desc
      limit 5;`,
    );
    return result.rows;
  }
};

// TODO: consider including in-progress too
/**
 * Get top authors by length of sections by them posted, excluding multivoices
 * @param [year] Year to get authors for, leave blank for all time
 * @returns Ordered list of 10 top authors by length, with objects with `author_name` and `author_len`
 */
export const getTopAuthorsLen = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
): Promise<{ author_name: string; author_len: Length }[]> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select author.username as name, sum(section.length) as len from section
        inner join podfic on section.podfic_id = podfic.podfic_id
        inner join work on podfic.work_id = work.work_id
        inner join author on work.author_id = author.author_id
      where
        work.author_id is not null
        and section.length is not null
        and ${IS_POSTED(includeUnposted, 'section')}
        and section.number > 0
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
        and date_part('year', section.posted_date) = $1
      group by author.username
      order by len desc
      limit 5;`,
      [year],
    );
    return result.rows;
  } else {
    const result = await client.query(
      `select author.username as author_name, sum(section.length) as author_len from section
        inner join podfic on section.podfic_id = podfic.podfic_id
        inner join work on podfic.work_id = work.work_id
        inner join author on work.author_id = author.author_id
      where
        work.author_id is not null
        and section.length is not null
        and ${IS_POSTED(includeUnposted, 'section')}
        and section.number > 0
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      group by author.username
      order by author_len desc
      limit 10;
      `,
    );
    return result.rows;
  }
};

// TODO: make all these support an include multivoice toggle
/**
 * Get top authors by count of works by them posted, excluding multivoices
 * NOTE: Does not use year param as this currently isn't supported per year
 */
export const getTopAuthorsCount = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select author.username as name, count(*) as count from podfic
        inner join work on podfic.work_id = work.work_id
        inner join author on work.author_id = author.author_id
      where
        work.author_id is not null
        and ${IS_POSTED(includeUnposted, 'podfic')}
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
        and date_part('year', posted_date) = $1
      group by author.username
      order by count desc
      limit 5;`,
      [year],
    );
    return result.rows;
  } else {
    const result = await client.query(
      `select author.username as author_name, count(*) as author_count from podfic
        inner join work on podfic.work_id = work.work_id
        inner join author on work.author_id = author.author_id
      where
        work.author_id is not null
        and ${IS_POSTED(includeUnposted, 'podfic')}
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      group by author.username
      order by author_count desc
      limit 5;`,
    );
    return result.rows;
  }
};

// TODO: this is perhaps a questionable way to count things, but okay
// TODO: options for including/excluding multivoices & unposted
export const getWorksCount = async (
  year: number | string,
): Promise<{ total: number; works: number; chapters: number }> => {
  const client = await getDBClient();
  const singleWorksResult = await client.query(
    `select count(*) from podfic
      inner join work on podfic.work_id = work.work_id
    where
      date_part('year', posted_date) = $1
      and ${IS_NOT_CHAPTERED}`,
    [year],
  );
  const chaptersResult = await client.query(
    `select count(*) from section
      ${CHECK_POSTED_CHAPTERED_SECTION}
      and date_part('year', section.posted_date) = $1`,
    [year],
  );
  const totalResultWorks = await client.query(
    `select count(*) from podfic
    where
      date_part('year', posted_date) = $1`,
    [year],
  );

  return {
    total:
      parseInt(totalResultWorks.rows[0].count) +
      parseInt(chaptersResult.rows[0].count),
    works: singleWorksResult.rows[0].count,
    chapters: chaptersResult.rows[0].count,
  };
};

export const getRatingCount = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select rating, count(*) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        ${IS_POSTED(includeUnposted)}
        and (date_part('year', posted_date) = $1 or posted_year = $1)
        and rating is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      group by rating;`,
      [year],
    );
    const reduced = result.rows.reduce((acc, cur) => {
      acc[cur.rating] = cur.count;
      return acc;
    }, {});
    return reduced;
  } else {
    const result = await client.query(
      `select rating, count(*) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        ${IS_POSTED(includeUnposted)}
        and rating is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      group by rating;`,
    );
    return result.rows;
  }
};

export const getCategoryCount = async (
  year = null,
  includeMultivoices = false,
  includeUnposted = false,
) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select category, count(*) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        ${IS_POSTED(includeUnposted)}
        and (date_part('year', posted_date) = $1 or posted_year = $1)
        and category is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      group by category;`,
      [year],
    );
    const reduced = result.rows.reduce((acc, cur) => {
      acc[cur.category] = cur.count;
      return acc;
    }, {});
    return reduced;
  } else {
    const result = await client.query(
      `select category, count(*) from podfic
        inner join work on podfic.work_id = work.work_id
      where
        ${IS_POSTED(includeUnposted)}
        and category is not null
        and ${includeMultivoices ? IS_SELF_POSTED : IS_NOT_MULTIVOICE}
      group by category;`,
    );
    return result.rows;
  }
};

// TODO: options for multivoice inclusion probably
export const getTopEvents = async (year) => {
  const client = await getDBClient();

  const result = await client.query(
    `select event.name as event_name, event.year as year, count(*) from podfic
      inner join work on podfic.work_id = work.work_id
      inner join event on podfic.event_id = event.event_id
    where
      (date_part('year', posted_date) = $1 or posted_year = $1)
    group by event.name, event.year
    order by event_name`,
    [year],
  );
  return result.rows;
};

export const getWithCoverArt = async (year = null) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `
      select count(*) from podfic inner join cover_art on cover_art.podfic_id = podfic.podfic_id where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1);`,
      [year],
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(`
      select count(*) from podfic inner join cover_art on cover_art.podfic_id = podfic.podfic_id where podfic.status = 'Posted';`);
    return result.rows[0].count;
  }
};

export const getWithMusic = async (year = null, includeUnposted = false) => {
  const client = await getDBClient();

  if (year) {
    // ohhh this will overcount w/ multiple music
    const result = await client.query(
      `select count(*) from
        (select count(*), podfic.podfic_id from podfic
          inner join resource_podfic on resource_podfic.podfic_id = podfic.podfic_id
          inner join resource on resource.resource_id = resource_podfic.resource_id
        where
          ${IS_POSTED(includeUnposted, 'podfic')}
          and (date_part('year', posted_date) = $1 or posted_year = $1)
          and resource.resource_type = 'Music'
        group by podfic.podfic_id) p;`,
      [year],
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(`
    select count(*) from
      (select count(*), podfic.podfic_id from podfic
        inner join resource_podfic on resource_podfic.podfic_id = podfic.podfic_id
        inner join resource on resource.resource_id = resource_podfic.resource_id
      where ${IS_POSTED(includeUnposted, 'podfic')} and resource.resource_type = 'Music'
      group by podfic.podfic_id) p;`);
    return result.rows[0].count;
  }
};

/**
 * Gets count of multivoices posted
 * @param [year] Year to get stats for, leave blank for all time
 * @returns Number of multivoices as a string
 */
export const getMultivoiceCount = async (year = null) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select count(*) from podfic where is_multivoice is true and status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1);`,
      [year],
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(
      `select count(*) from podfic where is_multivoice is true and status = 'Posted';`,
    );
    return result.rows[0].count;
  }
};

export const getMultivoiceInfo = async ({
  year,
  includeUnposted,
}: {
  year?: string | number;
  includeUnposted?: boolean;
}): Promise<{ count: number; length: Length }> => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select count(*), sum(section.length) from section
        inner join podfic on section.podfic_id = podfic.podfic_id
      where
        is_multivoice is true
        and section.part_id is not null
        and date_part('year', podfic.posted_date) = $1`,
      [year],
    );
    return {
      count: result.rows[0].count,
      length: result.rows[0].sum,
    };
  } else {
    const result = await client.query(
      `select count(*), sum(section.length) from section
        inner join podfic on section.podfic_id = podfic.podfic_id
      where
        is_multivoice is true
        and section.part_id is not null
        and date_part('year', podfic.posted_date) = $1`,
    );
    return {
      count: result.rows[0].count,
      length: result.rows[0].length,
    };
  }
};

export const getParts = async (year = null) => {
  const client = await getDBClient();

  if (year) {
    const result = await client.query(
      `select count(*) from part inner join podfic on part.podfic_id = podfic.podfic_id where status = 'Posted' and (date_part('year', created_at) = $1 or year = $1);`,
      [year],
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(
      `select count(*) from part inner join podfic on part.podfic_id = podfic.podfic_id where status = 'Posted';`,
    );
    return result.rows[0].count;
  }
};
