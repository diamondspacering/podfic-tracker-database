import {
  addLengths,
  getLengthFromValue,
  getLengthValue,
} from '@/app/lib/lengthHelpers';
import {
  getAllPostedWords,
  getAvgChapterLength,
  getAvgPodficLength,
  getCategoryCount,
  getChapterLength,
  getLongestChapter,
  getLongestPodfic,
  getLongestSingleWorkPodfic,
  getMultivoiceInfo,
  getPodficLength,
  getPostedChapterWords,
  getPostedSinglePodficWords,
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
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const year = searchParams.get('year');
  const includeMultivoices = searchParams.get('include_multivoices') === 'true';

  if (!year) {
    // TODO: get overall info?

    return NextResponse.json({});
  }

  // and then query the other guys?
  // use the loader function for like totalcount, etc.
  const totalLen = await getTotalPodficLength(year, includeMultivoices);
  const podficLen = await getPodficLength(year, includeMultivoices);
  const chapterLen = await getChapterLength(year);

  const worksAvg = await getAvgPodficLength(year, includeMultivoices);
  const chaptersAvg = await getAvgChapterLength(year);
  const totalAvg = getLengthFromValue(
    getLengthValue(addLengths(worksAvg, chaptersAvg)) / 2,
  );

  const longestPodfic = await getLongestPodfic(year, includeMultivoices);
  const longestSinglePodfic = await getLongestSingleWorkPodfic(
    year,
    includeMultivoices,
  );
  const longestChapter = await getLongestChapter(year);
  const shortestPodfic = await getShortestPodfic(year, includeMultivoices);
  const shortestChapter = await getShortestChapter(year);

  const worksCount = await getWorksCount(year);

  const totalWords = await getAllPostedWords(year, includeMultivoices);
  const podficWords = await getPostedSinglePodficWords(
    year,
    includeMultivoices,
  );
  const chapterWords = await getPostedChapterWords(year);

  const rawLength = await getTotalRawLength(year);
  const rawWordcount = await getRawWordcount(year);

  const multivoiceInfo = await getMultivoiceInfo({ year });
  const withCoverArt = await getWithCoverArt(year);
  const withMusic = await getWithMusic(year);

  const ratings = await getRatingCount(year, includeMultivoices);
  const categories = await getCategoryCount(year, includeMultivoices);
  const events = await getTopEvents(year);

  const topFandomsCount = await getTopFandomsCount(year, includeMultivoices);
  const topFandomsLen = await getTopFandomsLen(year, includeMultivoices);

  return NextResponse.json({
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
  });
}
