import { sourceCodePro } from '@/app/fonts/fonts';
import styles from './stats.module.css';
import dashboardStyles from '@/app/dashboard/dashboard.module.css';
import {
  getAvgChapterLength,
  getAvgPodficLength,
  getCategoryCount,
  getChapterLength,
  getLongestChapter,
  getLongestPodfic,
  getLongestSingleWorkPodfic,
  getMultivoice,
  getPodficLength,
  getPostedChapterWords,
  getPostedPodficWords,
  getPostedWords,
  getRatingCount,
  getRawWordcount,
  getShortestChapter,
  getShortestPodfic,
  getTopEvents,
  getTopFandomsCount,
  getTopFandomsLen,
  getTotalPodficLength,
  getTotalRawLength,
  getWithCoverArt,
  getWithMusic,
  getWorksCount,
} from '@/app/lib/stats';
import { getLengthText } from '@/app/lib/format';
import {
  getLengthFromValue,
  getLengthValue,
  addLengths,
} from '@/app/lib/lengthHelpers';

export default async function YearStats({ year }) {
  const totalLen = await getTotalPodficLength(year);
  const podficLen = await getPodficLength(year);
  const chapterLen = await getChapterLength(year);

  const longestPodfic = await getLongestPodfic(year);
  const longestSinglePodfic = await getLongestSingleWorkPodfic(year);
  const longestChapter = await getLongestChapter(year);
  const shortestPodfic = await getShortestPodfic(year);
  const shortestChapter = await getShortestChapter(year);

  const worksAvg = await getAvgPodficLength(year);
  const chaptersAvg = await getAvgChapterLength(year);

  const worksCount = await getWorksCount(year);
  // const totalWords = await getPostedWords(year);
  const podficWords = await getPostedPodficWords(year);
  const chapterWords = await getPostedChapterWords(year);

  const rawLength = await getTotalRawLength(year);
  const rawWordCount = await getRawWordcount(year);

  const multivoice = await getMultivoice(year);
  const withCoverArt = await getWithCoverArt(year);
  const withMusic = await getWithMusic(year);

  const topFandomsCount = await getTopFandomsCount(year);
  const topFandomsLen = await getTopFandomsLen(year);

  const ratings = await getRatingCount(year);
  const categories = await getCategoryCount(year);
  const events = await getTopEvents(year);

  return (
    <div className={`${dashboardStyles.flexRow} ${sourceCodePro.className}`}>
      <div className={styles.titleColumn}>{year}</div>
      <div className={styles.statsBlock}>
        <div className={styles.flexRow}>
          {/* <div className={styles.flexColumn}>
            <span className={styles.headerText}>Productivity Total</span>
          </div> */}
          <table className={styles.statsTable}>
            <thead>
              <tr className={styles.headerText}>
                <td colSpan={2}>Productivity Total</td>
                <td style={{ textAlign: 'right' }}>Works</td>
                <td style={{ textAlign: 'right' }}>Chapters</td>
              </tr>
            </thead>
            <tbody>
              {/* Total length */}
              <tr>
                <td>
                  <b>Total length:</b>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(totalLen)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(podficLen.sum)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(chapterLen.sum)}
                </td>
              </tr>
              {/* Average length */}
              <tr>
                <td>
                  <b>Average:</b>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(
                    getLengthFromValue(
                      getLengthValue(
                        addLengths(worksAvg.avg, chaptersAvg.avg)
                      ) / 2
                    )
                  )}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(worksAvg.avg)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(chaptersAvg.avg)}
                </td>
              </tr>
              {/* Longest */}
              <tr>
                <td>
                  <b>Longest:</b>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthValue(longestPodfic.length) >
                  getLengthValue(longestChapter.length)
                    ? getLengthText(longestPodfic.length)
                    : getLengthText(longestChapter.length)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(longestSinglePodfic.length)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(longestChapter.length)}
                </td>
              </tr>
              {/* Shortest */}
              <tr>
                <td>
                  <b>Shortest:</b>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthValue(shortestPodfic.length) <
                  getLengthValue(shortestChapter.length)
                    ? getLengthText(shortestPodfic.length)
                    : getLengthText(shortestChapter.length)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(shortestPodfic.length)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(shortestChapter.length)}
                </td>
              </tr>
              {/* Total works */}
              <tr>
                <td>
                  <b>Total works:</b>
                </td>
                <td style={{ textAlign: 'right' }}>{worksCount.total}</td>
                <td style={{ textAlign: 'right' }}>{worksCount.works}</td>
                <td style={{ textAlign: 'right' }}>{worksCount.chapters}</td>
              </tr>
              {/* Words */}
              <tr>
                <td>
                  <b>Words:</b>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {/* that WAS totalwords sum what is total words how is it different?? */}
                  {(
                    parseInt(podficWords.sum) + parseInt(chapterWords.sum)
                  ).toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {parseInt(podficWords.sum).toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {parseInt(chapterWords.sum).toLocaleString()}
                </td>
              </tr>
              {/* Recorded */}
              {/* TODO: something is weird about these. they're ALMOST right. but something is very weird. figure that out. */}
              <tr>
                <td>
                  <b>Recorded:</b>
                </td>
                <td style={{ textAlign: 'right' }}>
                  {rawWordCount.wordcount?.toLocaleString()}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(rawLength.sum)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {getLengthText(rawWordCount.length)}
                </td>
              </tr>
              {/* Multivoice */}
              <tr>
                <td>
                  <b>Multivoice:</b>
                </td>
                <td>{multivoice}</td>
              </tr>
              {/* With Cover Art */}
              <tr>
                <td>
                  <b>With Cover Art:</b>
                </td>
                <td>{withCoverArt}</td>
              </tr>
              {/* With Music */}
              <tr>
                <td>
                  <b>With Music:</b>
                </td>
                <td>{withMusic}</td>
              </tr>
            </tbody>
          </table>

          {/* Ratings */}
          <div className={styles.flexColumn}>
            <span className={styles.headerText}>Ratings</span>
            <table className={styles.statsTable}>
              <tbody>
                <tr>
                  <td>
                    <b>G</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>{ratings['Gen'] ?? 0}</td>
                </tr>
                <tr>
                  <td>
                    <b>T</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>{ratings['Teen'] ?? 0}</td>
                </tr>
                <tr>
                  <td>
                    <b>M</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {ratings['Mature'] ?? 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>E</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {ratings['Explicit'] ?? 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Categories */}
          <div className={styles.flexColumn}>
            <span className={styles.headerText}>Categories</span>
            <table className={styles.statsTable}>
              <tbody>
                <tr>
                  <td>
                    <b>Gen</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {categories['Gen'] ?? 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>F/F</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {categories['F/F'] ?? 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>F/M</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {categories['F/M'] ?? 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>M/M</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {categories['M/M'] ?? 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Other</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {categories['Other'] ?? 0}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Multi</b>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {categories['Multi'] ?? 0}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Events */}
          <div className={styles.flexColumn}>
            <span className={styles.headerText}>Events</span>
            <table className={styles.statsTable}>
              <tbody>
                {events.map((event, i) => (
                  <tr key={i}>
                    <td>{`${event.event_name}${
                      event.year !== year ? ` ${event.year}` : ''
                    }`}</td>
                    <td>{event.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Fandoms */}
          <div className={styles.flexColumn}>
            <span className={styles.headerText}>Top By Count</span>
            <table className={styles.statsTable}>
              <tbody>
                {topFandomsCount.map((fandom, index) => (
                  <tr key={index}>
                    <td>
                      <b>{index + 1}</b>
                    </td>
                    <td>
                      <i>{fandom.fandom_name}</i>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {fandom.fandom_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <span className={styles.headerText}>Top By Length</span>
            <table className={styles.statsTable}>
              <tbody>
                {topFandomsLen.map((fandom, index) => (
                  <tr key={index}>
                    <td>
                      <b>{index + 1}</b>
                    </td>
                    <td>
                      <i>{fandom.fandom_name}</i>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {getLengthText(fandom.fandom_len)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* With Cover Art & Music */}
        </div>
      </div>
    </div>
  );
}
