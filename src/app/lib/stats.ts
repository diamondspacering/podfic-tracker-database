'use server';
// this will probably need to be a client component at some point...

import { getEmptyLength } from '../types';
import { getClient } from './db-helpers';
import { addLengths, getLengthValue } from './lengthHelpers';

// TODO: revamp these a bit because there's something deeply wrong w/ your numbers
// TODO: also revamp these to work with sections that'll be extremely fun

export const getPodficCountByYear = async () => {
  const client = await getClient();
  const dateResult = await client.query(
    `select date_part('year', posted_date) as year, count(posted_date) from podfic group by year;`
  );
  const yearResult = await client.query(
    `select posted_year, count(posted_year) from podfic where posted_date is null group by posted_year;`
  );
  console.log('podfic count by year:', dateResult.rows);
  console.log('podfic count by year:', yearResult.rows);
  // return result.rows;

  const reduced = dateResult.rows.reduce((acc, cur) => {
    if (cur.year) acc[cur.year] = cur.count;
    return acc;
  }, {});
  return reduced;
};

// TODO: the way I'm recording length makes like single year podfic things....tricky? possibly?
// hmm this specifically excludes chapters....interesting that might work
export const fetchPodficSingleWorkLengthByYear = async () => {
  const client = await getClient();
  const result = await client.query(`
    select sum(length), date_part('year', posted_date) as year from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and (chaptered is not true or posted_unchaptered is true) and podfic.type != 'multivoice' group by year;
  `);
  console.log('podfic single work length by year:', result.rows);
  return result.rows;
};

// TODO: this may need to be tweaked w/ the posted year or whatever? yeah so add posted in that year and posted year
// what are we aiming for here?
export const fetchPodficLengthByYear = async () => {
  const client = await getClient();
  const result = await client.query(`
    select sum(length), date_part('year', posted_date) as year from podfic where status = 'Posted' group by year
  `);
  console.log('podfic length by year:', result.rows);
  return result.rows;
};

export const getPodficSingleWorkLengthByYear = async () => {
  const podfics = await fetchPodficSingleWorkLengthByYear();

  const reducedPodfics = podfics.reduce((acc, cur) => {
    if (cur.year) acc[cur.year] = cur.sum;
    return acc;
  }, {});
  return reducedPodfics;
};

export const getPodficLengthByYear = async () => {
  const podfics = await fetchPodficLengthByYear();

  const reducedPodfics = podfics.reduce((acc, cur) => {
    if (cur.year) acc[cur.year] = cur.sum;
    return acc;
  }, {});
  return reducedPodfics;
};

export const getPodficLength = async (year) => {
  const client = await getClient();
  const result = await client.query(
    `select sum(length) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and (chaptered is not true or posted_unchaptered is true)`,
    [year]
  );
  return result.rows[0] ?? {};
};

export const getChapterLengthByYear = async () => {
  const client = await getClient();
  const result = await client.query(`
    select sum(length), date_part('year', posted_date) as year from chapter where status = 'Posted' group by year;
  `);
  console.log('chapter length by year:', result.rows);
  return result.rows;
};

export const getChapterLength = async (year) => {
  const client = await getClient();
  const result = await client.query(
    `select sum(length) from chapter where status = 'Posted' and date_part('year', posted_date) = $1`,
    [year]
  );
  return result.rows[0] ?? {};
};

export const getPodficAndChapterLengthByYear = async () => {
  const podfics = await fetchPodficSingleWorkLengthByYear();
  const chapters = await getChapterLengthByYear();

  // and then combine and return
  const reducedPodfics = podfics.reduce((acc, cur) => {
    acc[cur.year] = cur.sum;
    return acc;
  }, {});
  console.log({ reducedPodfics });
  const reducedChapters = chapters.reduce((acc, cur) => {
    if (cur.year) {
      acc[cur.year] = cur.sum;
    }
    return acc;
  }, {});
  console.log({ reducedChapters });

  const combined = Object.keys(reducedPodfics).reduce((acc, cur) => {
    acc[cur] = addLengths(
      reducedPodfics[cur] ?? getEmptyLength(),
      reducedChapters[cur] ?? getEmptyLength()
    );
    return acc;
  }, {});
  console.log({ combined });
  return combined;
};

export const getLongestPodfic = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select length from podfic where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and length is not null order by length desc limit 1`,
      [year]
    );
    const chapterResult = await client.query(
      `select length from chapter where status = 'Posted' and date_part('year', posted_date) = $1 and length is not null order by length desc limit 1`,
      [year]
    );
    if (
      getLengthValue(chapterResult.rows[0]?.length) >
      getLengthValue(result.rows[0]?.length)
    ) {
      return chapterResult.rows[0];
    }
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select length from podfic where podfic.status = 'Posted' and length is not null order by length desc limit 1`
    );
    console.log('longest podfic:', result.rows[0]);
    return result.rows[0] ?? {};
  }
};

export const getLongestSingleWorkPodfic = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select length from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and length is not null and (chaptered is not true or posted_unchaptered is true) order by length desc limit 1`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select length from podfic where podfic.status = 'Posted' and length is not null and (chaptered is not true or posted_unchaptered is true) order by length desc limit 1`
    );
    return result.rows[0] ?? {};
  }
};

export const getLongestChapter = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select length from chapter where status = 'Posted' and date_part('year', posted_date) = $1 and length is not null order by length desc limit 1`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select length from chapter where status = 'Posted' and length is not null order by length desc limit 1`
    );
    return result.rows[0] ?? {};
  }
};

export const getShortestPodfic = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select length from podfic where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and length is not null order by length limit 1`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select length from podfic where podfic.status = 'Posted' and length is not null order by length limit 1`
    );
    console.log('shortest podfic:', result.rows[0]);
    return result.rows[0] ?? {};
  }
};

export const getShortestChapter = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select length from chapter where status = 'Posted' and date_part('year', posted_date) = $1 and length is not null order by length limit 1`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select length from chapter where status = 'Posted' and length is not null order by length limit 1`
    );
    return result.rows[0] ?? {};
  }
};

export const getAvgPodficLength = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select avg(length) from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and length is not null and (chaptered is not true or posted_unchaptered is true)`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select avg(length) from podfic where podfic.status = 'Posted' and length is not null`
    );
    console.log('avg podfic length:', result.rows[0]);
    return result.rows[0] ?? {};
  }
};

export const getAvgChapterLength = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select avg(length) from chapter where status = 'Posted' and date_part('year', posted_date) = $1 and length is not null`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select avg(length) from chapter where status = 'Posted' and length is not null`
    );
    return result.rows[0] ?? {};
  }
};

export const getPostedWords = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select sum(wordcount) from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and podfic.type != 'multivoice' and wordcount is not null`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select sum(wordcount) from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and podfic.type != 'multivoice' and wordcount is not null`
    );
    return result.rows[0] ?? {};
  }
};

export const getAllPostedWords = async () => {
  const client = await getClient();

  const podficResult = await client.query(
    `select sum(wordcount) from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and podfic.type != 'multivoice' and work.chaptered is not true`
  );
  const chapterResult = await client.query(
    `select sum(wordcount) from chapter where chapter.status = 'Posted'`
  );
  return (
    parseInt(podficResult.rows[0].sum) + parseInt(chapterResult.rows[0].sum)
  );
};

export const getPostedPodficWords = async (year) => {
  const client = await getClient();

  const result = await client.query(
    `select sum(wordcount) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and (chaptered is not true or posted_unchaptered is true) and wordcount is not null`,
    [year]
  );
  return result.rows[0] ?? {};
};

export const getPostedChapterWords = async (year) => {
  const client = await getClient();

  const result = await client.query(
    `select sum(wordcount) from chapter where status = 'Posted' and date_part('year', posted_date) = $1 and wordcount is not null`,
    [year]
  );
  return result.rows[0] ?? {};
};

export const getAvgPostedWords = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select avg(wordcount) from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and wordcount is not null`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select avg(wordcount) from podfic inner join work on podfic.work_id = work.work_id where podfic.status = 'Posted' and wordcount is not null`
    );
    return result.rows[0] ?? {};
  }
};

export const getTotalPodficLength = async (year = null) => {
  const client = await getClient();
  if (year) {
    const singleWorkLengthResult = await client.query(
      `
    select sum(length) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and (chaptered is not true or posted_unchaptered is true)
  `,
      [year]
    );
    const chapterLengthResult = await client.query(
      `
    select sum(length) from chapter where status = 'Posted' and date_part('year', posted_date) = $1
  `,
      [year]
    );
    const combinedLength = await addLengths(
      singleWorkLengthResult.rows[0].sum,
      chapterLengthResult.rows[0].sum
    );
    return combinedLength;
  } else {
    const singleWorkLengthResult = await client.query(`
    select sum(length) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and (chaptered is not true or posted_unchaptered is true)
  `);
    const chapterLengthResult = await client.query(`
    select sum(length) from chapter where status = 'Posted' and posted_date is not null
  `);
    const combinedLength = await addLengths(
      singleWorkLengthResult.rows[0].sum,
      chapterLengthResult.rows[0].sum
    );
    return combinedLength;
  }
};

export const getTotalRawLength = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select sum(length) from recording_session where date_part('year', date) = $1 or year = $1`,
      [year]
    );
    return result.rows[0] ?? {};
  } else {
    const result = await client.query(
      `select sum(length) from recording_session`
    );
    return result.rows[0] ?? {};
  }
};

export const getRawWordcount = async (year = null) => {
  const client = await getClient();

  if (year) {
    const podficResult = await client.query(
      `
      with podfic_sums as (
        select sum(recording_session.length) as len_sum, wordcount, podfic.podfic_id as sum from podfic
        inner join work on podfic.work_id = work.work_id
        inner join recording_session on recording_session.podfic_id = podfic.podfic_id
        where
          chaptered is not true
          and podfic.status <> 'Planning' and podfic.status <> 'Recording' and podfic.status is not null
          and (date_part('year', date) = $1 or year = $1)
          and recording_session.chapter_id is null
        group by podfic.podfic_id, wordcount
      )
      select sum(wordcount) as wordcount, sum(len_sum) as length from podfic_sums;
    `,
      [year]
    );
    const chapterResult = await client.query(
      `WITH chapter_sums as (select sum(recording_session.length) as len_sum, wordcount, chapter.chapter_id from chapter
        inner join recording_session on recording_session.chapter_id = chapter.chapter_id
      where
        chapter.status <> 'Planning'
        and chapter.status <> 'Recording'
        and chapter.status is not null
        and (date_part('year', date) = $1 or year = $1)
      group by chapter.chapter_id)
    select sum(wordcount) as wordcount, sum(len_sum) as length
    from chapter_sums;`,
      [year]
    );
    // const result = await client.query(
    //   `
    //   select sum(wordcount) from podfic inner join recording_session on recording_session.podfic_id = podfic.podfic_id inner join work on podfic.work_id = work.work_id where date_part('year', date) = $1 or year = $1;
    // `,
    //   [year]
    // );
    console.log(
      'raw wordcount by year:',
      year,
      podficResult.rows,
      chapterResult.rows
    );
    return {
      wordcount:
        parseInt(podficResult.rows[0].wordcount ?? 0) +
        parseInt(chapterResult.rows[0].wordcount ?? 0),
      length: addLengths(
        podficResult.rows[0].length,
        chapterResult.rows[0].length
      ),
    };
  } else {
    return null;
  }
};

export const getTopFandomsLenOld = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select fandom.name as fandom_name, sum(length) as fandom_len from podfic
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
        where work.fandom_id is not null and length is not null and podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1)
      group by fandom.name order by fandom_len desc limit 5;`,
      [year]
    );
    return result.rows;
  } else {
    const result = await client.query(
      `select fandom.name as fandom_name, sum(length) as fandom_len from podfic inner join work on podfic.work_id = work.work_id inner join fandom on work.fandom_id = fandom.fandom_id where work.fandom_id is not null and length is not null group by fandom.name order by fandom_len desc limit 10;`
    );
    return result.rows;
  }
};

export const getTopFandomsLen = async (year = null) => {
  const client = await getClient();

  if (year) {
    const podficResult = await client.query(
      `select fandom.name as fandom_name, sum(length) as fandom_len from podfic
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where podfic.status = 'Posted' and work.fandom_id is not null and length is not null
        and (date_part('year', posted_date) = $1 or posted_year = $1)
        and (chaptered is not true or posted_unchaptered is true)
      group by fandom.name order by fandom_len desc limit 10;
      `,
      [year]
    );
    const chapterResult = await client.query(
      `select fandom.name as fandom_name, sum(chapter.length) as fandom_len from chapter
        inner join podfic on chapter.podfic_id = podfic.podfic_id
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where chapter.status = 'Posted' and chapter.length is not null and date_part('year', chapter.posted_date) = $1
      group by fandom.name order by fandom_len desc limit 10`,
      [year]
    );
    const podficObj = podficResult.rows.reduce((acc, cur) => {
      acc[cur.fandom_name] = cur.fandom_len;
      return acc;
    }, {});
    const combinedObj = chapterResult.rows.reduce((acc, cur) => {
      if (acc[cur.fandom_name]) {
        acc[cur.fandom_name] = addLengths(acc[cur.fandom_name], cur.fandom_len);
      } else acc[cur.fandom_name] = cur.fandom_len;
      return acc;
    }, podficObj);
    const list = Object.keys(combinedObj).map((fandom) => ({
      fandom_name: fandom,
      fandom_len: combinedObj[fandom],
    }));
    return list
      .sort(
        (a, b) => getLengthValue(b.fandom_len) - getLengthValue(a.fandom_len)
      )
      .slice(0, 5);
  } else {
    const podficResult = await client.query(
      `select fandom.name as fandom_name, sum(length) as fandom_len from podfic
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where podfic.status = 'Posted' and work.fandom_id is not null and length is not null
        and (chaptered is not true or posted_unchaptered is true)
      group by fandom.name order by fandom_len desc limit 10;
      `
    );
    const chapterResult = await client.query(
      `select fandom.name as fandom_name, sum(chapter.length) as fandom_len from chapter
        inner join podfic on chapter.podfic_id = podfic.podfic_id
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
      where chapter.status = 'Posted' and chapter.length is not null
      group by fandom.name order by fandom_len desc limit 10`
    );
    const podficObj = podficResult.rows.reduce((acc, cur) => {
      acc[cur.fandom_name] = cur.fandom_len;
      return acc;
    }, {});
    const combinedObj = chapterResult.rows.reduce((acc, cur) => {
      if (acc[cur.fandom_name]) {
        acc[cur.fandom_name] = addLengths(acc[cur.fandom_name], cur.fandom_len);
      } else acc[cur.fandom_name] = cur.fandom_len;
      return acc;
    }, podficObj);
    const list = Object.keys(combinedObj).map((fandom) => ({
      fandom_name: fandom,
      fandom_len: combinedObj[fandom],
    }));
    return list.sort(
      (a, b) => getLengthValue(b.fandom_len) - getLengthValue(a.fandom_len)
    );
  }
};

export const getTopFandomsCount = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select fandom.name as fandom_name, count(*) as fandom_count from podfic
        inner join work on podfic.work_id = work.work_id
        inner join fandom on work.fandom_id = fandom.fandom_id
        where work.fandom_id is not null and podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1)
      group by fandom.name order by fandom_count desc limit 5;`,
      [year]
    );
    return result.rows;
  } else {
    const result = await client.query(
      `select fandom.name as fandom_name, count(*) as fandom_count from podfic inner join work on podfic.work_id = work.work_id inner join fandom on work.fandom_id = fandom.fandom_id where work.fandom_id is not null and podfic.status = 'Posted' group by fandom.name order by fandom_count desc limit 5;`
    );
    return result.rows;
  }
};

export const getTopAuthorsLen = async (year = null) => {
  const client = await getClient();

  if (year) {
    return [];
  } else {
    // hmmmm we need chapter length too - just going for not limiting by posted for now but possibly a better way 2 do this
    const result = await client.query(
      `select author.username as author_name, sum(length) as author_len from podfic inner join work on podfic.work_id = work.work_id inner join author on work.author_id = author.author_id where work.author_id is not null and length is not null group by author.username order by author_len desc limit 10;`
    );
    return result.rows;
  }
};

export const getTopAuthorsCount = async (year = null) => {
  const client = await getClient();

  if (year) {
    return [];
  } else {
    const result = await client.query(
      `select author.username as author_name, count(*) as author_count from podfic inner join work on podfic.work_id = work.work_id inner join author on work.author_id = author.author_id where work.author_id is not null and podfic.status = 'Posted' group by author.username order by author_count desc limit 5;`
    );
    return result.rows;
  }
};

export const getWorksCount = async (year) => {
  const client = await getClient();
  const worksResult = await client.query(
    `select count(*) from podfic inner join work on podfic.work_id = work.work_id where date_part('year', posted_date) = $1 and (chaptered is not true or posted_unchaptered is true)`,
    [year]
  );
  const chaptersResult = await client.query(
    `select count(*) from chapter where date_part('year', posted_date) = $1`,
    [year]
  );
  const totalResultWorks = await client.query(
    `select count(*) from podfic where date_part('year', posted_date) = $1 or posted_year = $1`,
    [year]
  );

  return {
    total:
      parseInt(totalResultWorks.rows[0].count) +
      parseInt(chaptersResult.rows[0].count),
    works: worksResult.rows[0].count,
    chapters: chaptersResult.rows[0].count,
  };
};

export const getRatingCount = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select rating, count(*) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and rating is not null group by rating;`,
      [year]
    );
    const reduced = result.rows.reduce((acc, cur) => {
      acc[cur.rating] = cur.count;
      return acc;
    }, {});
    return reduced;
  } else {
    const result = await client.query(
      `select rating, count(*) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and rating is not null group by rating;`
    );
    return result.rows;
  }
};

export const getCategoryCount = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select category, count(*) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and category is not null group by category;`,
      [year]
    );
    const reduced = result.rows.reduce((acc, cur) => {
      acc[cur.category] = cur.count;
      return acc;
    }, {});
    return reduced;
  } else {
    const result = await client.query(
      `select category, count(*) from podfic inner join work on podfic.work_id = work.work_id where status = 'Posted' and category is not null group by category;`
    );
    return result.rows;
  }
};

export const getTopEvents = async (year) => {
  const client = await getClient();

  const result = await client.query(
    `select event.name as event_name, event.year as year, count(*) from podfic inner join work on podfic.work_id = work.work_id inner join event on podfic.event_id = event.event_id where (date_part('year', posted_date) = $1 or posted_year = $1) group by event.name, event.year order by event_name`,
    [year]
  );
  return result.rows;
};

export const getWithCoverArt = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `
      select count(*) from podfic inner join cover_art on cover_art.podfic_id = podfic.podfic_id where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1);`,
      [year]
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(`
      select count(*) from podfic inner join cover_art on cover_art.podfic_id = podfic.podfic_id where podfic.status = 'Posted';`);
    return result.rows[0].count;
  }
};

export const getWithMusic = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `
      select count(*) from podfic
        inner join resource_podfic on resource_podfic.podfic_id = podfic.podfic_id
        inner join resource on resource.resource_id = resource_podfic.resource_id
      where podfic.status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1) and resource.resource_type = 'Music';`,
      [year]
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(`
      select count(*) from podfic
        inner join resource_podfic on resource_podfic.podfic_id = podfic.podfic_id
        inner join resource on resource.resource_id = resource_podfic.resource_id
      where podfic.status = 'Posted' and resource.resource_type = 'Music';`);
    return result.rows[0].count;
  }
};

export const getMultivoice = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select count(*) from podfic where type = 'multivoice' and status = 'Posted' and (date_part('year', posted_date) = $1 or posted_year = $1);`,
      [year]
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(
      `select count(*) from podfic where type = 'multivoice' and status = 'Posted';`
    );
    return result.rows[0].count;
  }
};

export const getParts = async (year = null) => {
  const client = await getClient();

  if (year) {
    const result = await client.query(
      `select count(*) from part inner join podfic on part.podfic_id = podfic.podfic_id where status = 'Posted' and (date_part('year', created_at) = $1 or year = $1);`,
      [year]
    );
    return result.rows[0].count;
  } else {
    const result = await client.query(
      `select count(*) from part inner join podfic on part.podfic_id = podfic.podfic_id where status = 'Posted';`
    );
    return result.rows[0].count;
  }
};

export const getSoloCount = async () => {
  const client = await getClient();

  const result = await client.query(
    `select count(*) from podfic where type != 'multivoice' and status = 'Posted'`
  );
  return result.rows[0].count;
};
