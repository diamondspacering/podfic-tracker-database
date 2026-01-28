// TODO: how to make it evaluate proper number of times?
// TODO: do we need to track specific bingos, or just the cards that are filled?
export const useSquaresInBingo = (
  bingoCard: BingoCard,
): { squaresInBingo: BingoSquare[]; blackout: boolean } => {
  console.log('useSquaresInBingo running');

  const rows = bingoCard.rows ?? [];
  const rowsFlat = rows.flat();
  let bingos: BingoSquare[] = [];

  // no bingos if not all squares are filled in
  if (rowsFlat.length < bingoCard.size * bingoCard.size)
    return { squaresInBingo: [], blackout: false };

  const hasBlackout = rowsFlat.every((square) => square.filled);
  if (hasBlackout) return { squaresInBingo: rowsFlat, blackout: true };

  const hasRowBingo = rows.some((row) => row.every((square) => square.filled));
  const rowBingos = rows.filter((row) => row.every((square) => square.filled));
  bingos = bingos.concat(rowBingos.flat());

  let columns = Array(bingoCard.size).fill(Array(bingoCard.size));
  columns = columns.map((_column, i) =>
    rowsFlat.filter((square) => square.column === i),
  );
  const columnBingos = columns.filter((column) =>
    column.every((square) => square.filled),
  );
  bingos = bingos.concat(columnBingos.flat());

  const leftDiagonal = rowsFlat.filter(
    (square) => square.row === square.column,
  );
  const leftDiagonalBingo = leftDiagonal.every((square) => square.filled);
  if (leftDiagonalBingo) bingos = bingos.concat(leftDiagonal);

  const rightDiagonal = rowsFlat.filter(
    (square) => square.row + square.column == bingoCard.size - 1,
  );
  const rightDiagonalBingo = rightDiagonal.every((square) => square.filled);
  if (rightDiagonalBingo) bingos = bingos.concat(rightDiagonal);

  const uniqueSquares = bingos.filter((square, i) => {
    const index = bingos.findIndex(
      (s) => s.row === square.row && s.column === square.column,
    );
    return index === i || index === -1;
  });

  return { squaresInBingo: uniqueSquares, blackout: false };
};
