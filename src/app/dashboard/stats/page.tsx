'use server';

import { Typography } from '@mui/material';
import dashboardStyles from '@/app/dashboard/dashboard.module.css';
import styles from './stats.module.css';
import { sourceCodePro } from '@/app/fonts/fonts';
import {
  getAllPostedWords,
  getAvgPodficLength,
  getAvgPostedWords,
  getLongestPodfic,
  getPodficAndChapterLengthByYear,
  getPodficCountByYear,
  // getPodficLengthByYear,
  getPodficSingleWorkLengthByYear,
  getPostedWords,
  getShortestPodfic,
  getSoloCount,
  getTopAuthorsCount,
  getTopAuthorsLen,
  getTopFandomsCount,
  getTopFandomsLen,
  getTotalPodficLength,
  getTotalRawLength,
} from '@/app/lib/stats';
import { getLengthText } from '@/app/lib/format';
import YearStats from './YearStats';

export const revalidate = 30;

// TODO: this is gonna need to be a client component my guy
// more detailed overview & each year pages? switch to specific years/all years? topic-based guys like authors, time you did stuff, etc
// actually put in charts lmao, figure out a charting library?

export default async function Page() {
  const years = [2025, 2024, 2023, 2022, 2021];
  const podficCountByYear = await getPodficCountByYear();
  const podficLengthByYearShort = await getPodficSingleWorkLengthByYear();
  // const podficLengthByYearLong = await getPodficLengthByYear();
  const combinedLengthByYear = await getPodficAndChapterLengthByYear();
  // have a single getstats hook it's not a hook whatever for each combo of things? yeah that seems reasonable. and do mapping lol. maybe for individual years manually doing it but it's fine
  const longestPodfic = await getLongestPodfic();
  const shortestPodfic = await getShortestPodfic();
  const avgLength = await getAvgPodficLength();
  const words = await getPostedWords();
  const avgWords = await getAvgPostedWords();
  const totalLength = await getTotalPodficLength();
  const totalRawLength = await getTotalRawLength();

  const topFandomsLen = await getTopFandomsLen();
  const topFandomsCount = await getTopFandomsCount();

  const topAuthorsLen = await getTopAuthorsLen();
  const topAuthorsCount = await getTopAuthorsCount();

  const allWords = await getAllPostedWords();

  const soloCount = await getSoloCount();

  return (
    <div className={styles.statsContainer}>
      <Typography variant='h1'>Stats</Typography>

      {/* Total stats */}
      <div className={`${dashboardStyles.flexRow} ${sourceCodePro.className}`}>
        <div className={styles.titleColumn}>Totals</div>
        <div className={styles.statsBlock}>
          <div
            className={styles.headerText}
            style={{ paddingLeft: '700px', paddingBottom: '15px' }}
          >
            Totals
          </div>
          <div className={styles.flexRow}>
            <table className={styles.statsTable}>
              <thead>
                <tr>
                  <th>year</th>
                  <th>works</th>
                  <th>minutes</th>
                  <th>minutes + chapters</th>
                </tr>
              </thead>
              <tbody>
                {years.map((year, i) => (
                  <tr key={i}>
                    <td>{year}</td>
                    <td>{podficCountByYear?.[year] ?? 0}</td>
                    <td>{getLengthText(podficLengthByYearShort?.[year])}</td>
                    <td style={{ textAlign: 'center' }}>
                      {getLengthText(combinedLengthByYear?.[year] ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.statsTable}>
              <tbody>
                <tr>
                  <td>
                    <b>
                      <i>longest</i>
                    </b>
                  </td>
                  <td>{getLengthText(longestPodfic.length)}</td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <i>shortest</i>
                    </b>
                  </td>
                  <td>{getLengthText(shortestPodfic.length)}</td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <i>average</i>
                    </b>
                  </td>
                  <td>{getLengthText(avgLength.avg)}</td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <i>words</i>
                    </b>
                  </td>
                  <td>{parseInt(words.sum).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <i>average words</i>
                    </b>
                  </td>
                  <td>{Math.round(avgWords.avg).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            <table className={styles.statsTable}>
              <tbody>
                <tr>
                  <td>
                    <b>
                      <i>length</i>
                    </b>
                  </td>
                  <td>{getLengthText(totalLength)}</td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <i>raw length</i>
                    </b>
                  </td>
                  <td>{getLengthText(totalRawLength.sum)}</td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <i>words</i>
                    </b>
                  </td>
                  <td>{allWords.toLocaleString()}</td>
                </tr>
                <tr>
                  <td>
                    <b>
                      <i>solo-count</i>
                    </b>
                  </td>
                  <td>{soloCount}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Fandoms */}
      <div className={`${dashboardStyles.flexRow} ${sourceCodePro.className}`}>
        <div className={styles.titleColumn}>Fandoms</div>
        <div className={styles.statsBlock}>
          <div
            className={styles.flexRow}
            style={{
              justifyContent: 'space-between',
            }}
          >
            <span className={styles.headerText}>Top 10 By Length</span>
            <span className={styles.headerText}>Top 5 By Count</span>
          </div>
          <div
            className={styles.flexRow}
            style={{
              paddingTop: '10px',
            }}
          >
            <table className={styles.statsTable}>
              <tbody>
                {topFandomsLen?.slice(0, 5).map((fandom, i) => (
                  <tr key={i}>
                    <td>
                      <b>{i + 1}</b>
                    </td>
                    <td>
                      <i>{fandom.fandom_name}</i>
                    </td>
                    <td>{getLengthText(fandom.fandom_len)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.statsTable}>
              <tbody>
                {topFandomsLen?.slice(5, 10).map((fandom, i) => (
                  <tr key={i}>
                    <td>
                      <b>{i + 6}</b>
                    </td>
                    <td>
                      <i>{fandom.fandom_name}</i>
                    </td>
                    <td>{getLengthText(fandom.fandom_len)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.statsTable}>
              <tbody>
                {topFandomsCount?.slice(0, 5).map((fandom, i) => (
                  <tr key={i}>
                    <td>
                      <b>{i + 1}</b>
                    </td>
                    <td>
                      <i>{fandom.fandom_name}</i>
                    </td>
                    <td>{fandom.fandom_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`${dashboardStyles.flexRow} ${sourceCodePro.className}`}>
        <div className={styles.titleColumn}>Authors</div>
        <div className={styles.statsBlock}>
          <div
            className={styles.flexRow}
            style={{
              justifyContent: 'space-between',
            }}
          >
            <span className={styles.headerText}>Top 10 By Length</span>
            <span className={styles.headerText}>Top 5 By Count</span>
          </div>
          <div
            className={styles.flexRow}
            style={{
              paddingTop: '10px',
            }}
          >
            <table className={styles.statsTable}>
              <tbody>
                {topAuthorsLen?.slice(0, 5).map((author, i) => (
                  <tr key={i}>
                    <td>
                      <b>{i + 1}</b>
                    </td>
                    <td>
                      <i>{author.author_name}</i>
                    </td>
                    <td>{getLengthText(author.author_len)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.statsTable}>
              <tbody>
                {topAuthorsLen?.slice(5, 10).map((author, i) => (
                  <tr key={i}>
                    <td>
                      <b>{i + 6}</b>
                    </td>
                    <td>
                      <i>{author.author_name}</i>
                    </td>
                    <td>{getLengthText(author.author_len)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.statsTable}>
              <tbody>
                {topAuthorsCount?.slice(0, 5).map((author, i) => (
                  <tr key={i}>
                    <td>
                      <b>{i + 1}</b>
                    </td>
                    <td>
                      <i>{author.author_name}</i>
                    </td>
                    <td>{author.author_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Yearly stats */}
      {years.map((year, i) => (
        <YearStats key={i} year={year} />
      ))}
    </div>
  );
}
