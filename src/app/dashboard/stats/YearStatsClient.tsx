'use client';

import { sourceCodePro } from '@/app/fonts/fonts';
import styles from './stats.module.css';
import dashboardStyles from '@/app/dashboard/dashboard.module.css';
import { useYearStats } from '@/app/lib/swrLoaders';
import { useState } from 'react';
import { Checkbox, FormControlLabel } from '@mui/material';
import { getLengthText } from '@/app/lib/format';
import { getLengthValue } from '@/app/lib/lengthHelpers';
import { Category, Rating } from '@/app/types';

export default function YearStatsClient({ year }) {
  const [includeMultivoices, setIncludeMultivoices] = useState(false);

  const { stats } = useYearStats({ year, includeMultivoices });

  const {
    totalLen,
    podficLen,
    chapterLen,
    totalAvg,
    worksAvg,
    chaptersAvg,
    longestPodfic,
    longestSinglePodfic,
    longestChapter,
    shortestPodfic,
    shortestChapter,
    worksCount,
    totalWords,
    podficWords,
    chapterWords,
    rawLength,
    rawWordcount,
    multivoiceInfo,
    withCoverArt,
    withMusic,
    ratings,
    categories,
    events,
    topFandomsCount,
    topFandomsLen,
  } = stats;

  return (
    <div className={`${dashboardStyles.flexRow} ${sourceCodePro.className}`}>
      <div
        className={dashboardStyles.flexColumn}
        style={{ textAlign: 'right', alignItems: 'flex-end' }}
      >
        <div className={styles.titleColumn}>{year}</div>
        <div>
          {/* or consider putting this at right? */}
          <FormControlLabel
            label='Include my multivoices'
            style={{ fontSize: '0.75em' }}
            disableTypography
            labelPlacement='start'
            control={
              <Checkbox
                value={includeMultivoices}
                checked={includeMultivoices}
                onChange={(e) => setIncludeMultivoices(e.target.checked)}
              />
            }
          />
        </div>
      </div>
      <div className={styles.statsBlock}>
        <div className={styles.flexRow}>
          {/* Productivity Total */}
          <table className={styles.statsTable}>
            <thead>
              <tr className={styles.headerText}>
                <td colSpan={2}>Productivity Total</td>
                <td className={styles.right}>Works</td>
                <td className={styles.right}>Chapters</td>
              </tr>
            </thead>
            <tbody>
              {/* Total length */}
              <tr>
                <td>
                  <strong>Total length:</strong>
                </td>
                <td className={styles.right}>{getLengthText(totalLen)}</td>
                <td className={styles.right}>{getLengthText(podficLen)}</td>
                <td className={styles.right}>{getLengthText(chapterLen)}</td>
              </tr>

              {/* Average length */}
              <tr>
                <td>
                  <strong>Average:</strong>
                </td>
                <td className={styles.right}>{getLengthText(totalAvg)}</td>
                <td className={styles.right}>{getLengthText(worksAvg)}</td>
                <td className={styles.right}>{getLengthText(chaptersAvg)}</td>
              </tr>

              {/* Longest */}
              <tr>
                <td>
                  <strong>Longest:</strong>
                </td>
                <td className={styles.right}>
                  {getLengthValue(longestPodfic.length) >
                  getLengthValue(longestChapter.length)
                    ? getLengthText(longestPodfic.length)
                    : getLengthText(longestChapter.length)}
                </td>
                <td className={styles.right}>
                  {getLengthText(longestSinglePodfic.length)}
                </td>
                <td className={styles.right}>
                  {getLengthText(longestChapter.length)}
                </td>
              </tr>

              {/* Shortest */}
              <tr>
                <td>
                  <strong>Shortest:</strong>
                </td>
                <td className={styles.right}>
                  {getLengthValue(shortestPodfic.length) <
                  getLengthValue(shortestChapter.length)
                    ? getLengthText(shortestPodfic.length)
                    : getLengthText(shortestChapter.length)}
                </td>
                <td className={styles.right}>
                  {getLengthText(shortestPodfic.length)}
                </td>
                <td className={styles.right}>
                  {getLengthText(shortestChapter.length)}
                </td>
              </tr>

              {/* Total works */}
              <tr>
                <td>
                  <strong>Total works:</strong>
                </td>
                <td className={styles.right}>{worksCount.total}</td>
                <td className={styles.right}>{worksCount.works}</td>
                <td className={styles.right}>{worksCount.chapters}</td>
              </tr>

              {/* Words */}
              <tr>
                <td>
                  <strong>Words:</strong>
                </td>
                <td className={styles.right}>{totalWords.toLocaleString()}</td>
                <td className={styles.right}>{podficWords.toLocaleString()}</td>
                <td className={styles.right}>
                  {chapterWords.toLocaleString()}
                </td>
              </tr>

              {/* Recorded */}
              <tr>
                <td>
                  <strong>Recorded:</strong>
                </td>
                <td className={styles.right}>
                  {rawWordcount.wordcount?.toLocaleString()}
                </td>
                <td className={styles.right}>{getLengthText(rawLength)}</td>
              </tr>

              {/* Multivoice */}
              <tr>
                <td>
                  <strong>Multivoice parts:</strong>
                </td>
                <td className={styles.right}>{multivoiceInfo.count}</td>
                <td className={styles.right}>
                  {getLengthText(multivoiceInfo.length)}
                </td>
              </tr>

              {/* Cover art */}
              <tr>
                <td>
                  <strong>With Cover Art:</strong>
                </td>
                <td>{withCoverArt}</td>
              </tr>

              {/* Music */}
              <tr>
                <td>
                  <strong>With Music</strong>
                </td>
                <td>{withMusic}</td>
              </tr>
            </tbody>
          </table>

          {/* Ratings */}
          <div className={styles.flexColumn}>
            <table className={styles.statsTable}>
              <thead>
                <tr className={styles.headerText}>
                  <td>Ratings</td>
                </tr>
              </thead>
              <tbody>
                {Object.values(Rating).map((rating) => (
                  <tr key={rating}>
                    <td>
                      <strong>{`${rating.charAt(0)}`}</strong>
                    </td>
                    <td className={styles.right}>{ratings[rating] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Categories */}
          <div className={styles.flexColumn}>
            <table className={styles.statsTable}>
              <thead>
                <tr className={styles.headerText}>
                  <td>Categories</td>
                </tr>
              </thead>
              <tbody>
                {Object.values(Category).map((category) => (
                  <tr key={category}>
                    <td>
                      <strong>{category}</strong>
                    </td>
                    <td className={styles.right}>
                      {categories[category] ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Events */}
          <div className={styles.flexColumn}>
            <table className={styles.statsTable}>
              <thead>
                <tr className={styles.headerText}>
                  <td>Events</td>
                </tr>
              </thead>
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
            <table className={styles.statsTable}>
              <thead>
                <tr className={styles.headerText}>
                  <td colSpan={2}>Top By Count</td>
                </tr>
              </thead>
              <tbody>
                {topFandomsCount.map((fandom, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{index + 1}</strong>
                    </td>
                    <td>
                      <em>{fandom.fandom_name}</em>
                    </td>
                    <td className={styles.right}>{fandom.fandom_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <table className={styles.statsTable}>
              <thead>
                <tr className={styles.headerText}>
                  <td colSpan={2}>Top By Length</td>
                </tr>
              </thead>
              <tbody>
                {topFandomsLen.map((fandom, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{index + 1}</strong>
                    </td>
                    <td>
                      <em>{fandom.fandom_name}</em>
                    </td>
                    <td className={styles.right}>
                      {getLengthText(fandom.fandom_len)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
