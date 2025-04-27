export const getLengthText = (length: Length | null) => {
  if (!length) return '00:00:00';
  if (length.days) {
    length.hours += length.days * 24;
  }

  const lengthString = `${format2Digits(length.hours ?? 0)}:${format2Digits(
    length.minutes ?? 0
  )}:${format2Digits(length.seconds ?? 0)}`;
  return lengthString;
};

export const formatDateString = (date: Date) => {
  return `${date.getFullYear()}-${format2Digits(
    date.getMonth() + 1
  )}-${format2Digits(date.getDate())}`;
};

export const formatDateStringMonthFirst = (date: Date) => {
  return `${format2Digits(date.getMonth() + 1)}-${format2Digits(
    date.getDate()
  )}-${date.getFullYear()}`;
};

export const formatDateTimeString = (date: Date) => {
  const yearPart = `${date.getFullYear()}-${format2Digits(
    date.getMonth() + 1
  )}-${format2Digits(date.getDate())}`;
  const timePart = `${format2Digits(date.getHours())}:${format2Digits(
    date.getMinutes()
  )}`;
  return `${yearPart}T${timePart}`;
};

export const format2Digits = (num: number) => {
  return num.toString().padStart(2, '0');
};

export const getLengthUpdateString = (length: Length) => {
  return `PT${(length.hours ? length.hours : 0)
    .toString()
    .padStart(2, '0')}:${(length.minutes ? length.minutes : 0)
    .toString()
    .padStart(2, '0')}:${(length.seconds ? length.seconds : 0)
    .toString()
    .padStart(2, '0')}`;
};

export const transformDropboxLink = (link: string) => {
  const transformedLink = link.replace(
    'www.dropbox.com',
    'dl.dropboxusercontent.com'
  );
  console.log(`original link: ${link}, transformed link: ${link}`);
  return transformedLink;
};

export const generateAADate = (date?: string) => {
  // date will be in format 'YYYY-MM-DD' bc date selector
  let newDate = '';
  // TIMEZONE???
  const dateObj = date ? new Date(`${date}T00:00:00`) : new Date();
  newDate = `${dateObj.getDate().toString().padStart(2, '0')}${(
    dateObj.getMonth() + 1
  )
    .toString()
    .padStart(2, '0')}${dateObj.getFullYear()}`;
  return newDate;
};

export const getPodficEventContent = (podfic: Podfic & Work) => {
  const { title, wordcount, notes } = podfic;
  const blurb = notes?.find((note) => note.label === 'blurb');
  return `${title}\n${wordcount}\n<b>blurb:</b> ${blurb}`;
};
