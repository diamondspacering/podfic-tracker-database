'use client';

import { Button, Checkbox, FormControlLabel } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import BingoCard from './BingoCard';
import { useState } from 'react';
import BingoSquareDialog from './bingo-square/bingo-square-dialog';
import { useBingoCards } from '@/app/lib/swrLoaders';
import BingoCardDialog from './bingo-card/bingo-card-dialog';
import { Add } from '@mui/icons-material';
import BingoFillsDialog from './bingo-fills/bingo-fills-dialog';
import styles from '@/app/forms/forms.module.css';

export default function BingoPage() {
  const searchParams = useSearchParams();
  const showInactiveBingos = searchParams.get('active') === 'false';
  const router = useRouter();
  const pathname = usePathname();

  const { bingoCards, mutate } = useBingoCards({
    active: !showInactiveBingos,
  });

  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [selectedBingoCard, setSelectedBingoCard] = useState<BingoCard | null>(
    null,
  );
  const [squareDialogOpen, setSquareDialogOpen] = useState(false);
  const [selectedBingoSquare, setSelectedBingoSquare] =
    useState<BingoSquare | null>(null);
  const [fillsDialogOpen, setFillsDialogOpen] = useState(false);

  return (
    <div>
      {fillsDialogOpen && !!selectedBingoSquare && (
        <BingoFillsDialog
          isOpen={fillsDialogOpen}
          onClose={() => setFillsDialogOpen(false)}
          submitCallback={async () => {
            await mutate();
            setFillsDialogOpen(false);
            setSelectedBingoSquare(null);
          }}
          item={selectedBingoSquare}
        />
      )}
      {squareDialogOpen && !!selectedBingoSquare && (
        <BingoSquareDialog
          isOpen={squareDialogOpen}
          onClose={() => setSquareDialogOpen(false)}
          submitCallback={async () => {
            await mutate();
            setSquareDialogOpen(false);
            setSelectedBingoSquare(null);
          }}
          item={selectedBingoSquare}
        />
      )}
      {cardDialogOpen && (
        <BingoCardDialog
          isOpen={cardDialogOpen}
          onClose={() => setCardDialogOpen(false)}
          submitCallback={async () => {
            await mutate();
            setCardDialogOpen(false);
            setSelectedBingoCard(null);
          }}
          item={selectedBingoCard}
        />
      )}
      <Button variant='contained' onClick={() => console.log(bingoCards)}>
        log
      </Button>
      <br />
      <FormControlLabel
        label='Only active bingos'
        control={
          <Checkbox
            checked={!showInactiveBingos}
            onChange={(e) => {
              router.push(`${pathname}?active=${e.target.checked}`);
            }}
          />
        }
      />
      <br />
      <Button
        variant='contained'
        startIcon={<Add />}
        onClick={() => {
          setSelectedBingoCard(null);
          setCardDialogOpen(true);
        }}
      >
        Add Bingo Card
      </Button>

      <div className={styles.flexRow} style={{ gap: '30px' }}>
        {bingoCards.map((bingoCard) => (
          <BingoCard
            key={bingoCard.bingo_card_id}
            card={bingoCard}
            editCardCallback={() => {
              setSelectedBingoCard(bingoCard);
              setCardDialogOpen(true);
            }}
            openSquareCallback={(square: BingoSquare) => {
              setSelectedBingoSquare(square);
              setSquareDialogOpen(true);
            }}
            editFillsCallback={(square: BingoSquare) => {
              setSelectedBingoSquare(square);
              setFillsDialogOpen(true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
