export const getLengthBonus = (length: string | null) => {
  if (!length) return 0;
  const lengthArray = length.split(':');
  const hours = parseInt(lengthArray[0]);
  console.log({ hours });
  if (hours >= 1) return 20;
  const minutes = parseInt(lengthArray[1]);
  console.log({ minutes });
  if (minutes >= 30) return 15;
  if (minutes >= 10) return 10;
  return 0;
};
