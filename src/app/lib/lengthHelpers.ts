export const addLengths = (length1: Length, length2: Length) => {
  const totalSeconds = getLengthValue(length1) + getLengthValue(length2);

  const totalLength = {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };

  return totalLength;
};

export const addLengthStringToLength = (
  length: Length,
  lengthString: string
) => {
  const lengthArray = lengthString.split(':');
  const hours = parseInt(lengthArray[0]);
  const minutes = parseInt(lengthArray[1]);
  const seconds = parseInt(lengthArray[2]);

  return addLengths(length, { hours, minutes, seconds });
};

// returns a Length as a numeric value in seconds
export const getLengthValue = (length: Length | null) => {
  if (!length) return 0;
  return (
    (length.hours ?? 0) * 3600 +
    (length.minutes ?? 0) * 60 +
    (length.seconds ?? 0)
  );
};

// get a Length object from a numeric seconds value
export const getLengthFromValue = (value: number) => {
  return {
    hours: Math.floor(value / 3600),
    minutes: Math.floor((value % 3600) / 60),
    seconds: Math.round(value % 60),
  };
};
