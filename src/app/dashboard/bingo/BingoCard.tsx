import { IconButton, Typography } from '@mui/material';
import styles from './bingo.module.css';
import { Edit } from '@mui/icons-material';
import { useSquaresInBingo } from './bingoUtil';

export default function BingoCard({
  card,
  editCardCallback,
  openSquareCallback,
  editFillsCallback,
}: {
  card: BingoCard;
  editCardCallback: () => void;
  openSquareCallback: (square: BingoSquare) => void;
  editFillsCallback: (square: BingoSquare) => void;
}) {
  const { squaresInBingo, blackout } = useSquaresInBingo(card);

  return (
    <div className={`${styles.bingoCard}`}>
      <Typography variant='h5'>
        <span>{card.title ?? 'Untitled'}</span>
        <IconButton onClick={editCardCallback} sx={{ width: 'fit-content' }}>
          <Edit />
        </IconButton>
      </Typography>
      {Array.from(Array(card.size).keys()).map((i) => (
        <div key={i} className={styles.bingoRow}>
          {Array.from(Array(card.size).keys()).map((j) => {
            const square = card.rows?.[i].find((s) => s.column === j) ?? {
              bingo_card_id: card.bingo_card_id,
              row: i,
              column: j,
            };
            const isBingo = !!squaresInBingo.find(
              (value) =>
                value.row === square.row && value.column === square.column,
            );
            return (
              <div
                key={j}
                className={`${styles.bingoSquare} ${blackout ? styles.blackout : isBingo ? styles.isBingo : square.filled ? styles.filled : ''}`}
                onClick={() => {
                  if (!!square.title) {
                    editFillsCallback(square);
                  } else {
                    openSquareCallback(square);
                  }
                }}
              >
                {!!square.title && (
                  <div className={styles.editSquare}>
                    <IconButton
                      size='small'
                      sx={{ width: 'fit-content' }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openSquareCallback(square);
                      }}
                    >
                      <Edit sx={{ width: '15px' }} />
                    </IconButton>
                  </div>
                )}
                <div className={styles.bingoSquareContent}>
                  {square.title ? (
                    <div>
                      {square.title}
                      <div className={styles.bingoFills}>
                        {square.fills?.map((fill) => (
                          <span key={fill.bingo_fill_id}>
                            {fill.podfic_title ?? fill.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.empty}>Add</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
