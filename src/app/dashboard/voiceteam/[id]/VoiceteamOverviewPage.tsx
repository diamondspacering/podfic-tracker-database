import { createUpdateRound } from '@/app/lib/updaters';
import { Add } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Menu,
  MenuItem,
  TextField,
  Tooltip,
} from '@mui/material';
import { CellChange, Column, ReactGrid, Row } from '@silevis/reactgrid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/app/dashboard/voiceteam/voiceteam.module.css';
import vtStyles from './voiceteam-table.module.css';
import HotTable, { HotTableClass } from '@handsontable/react';

export default function VoiceteamOverviewPage({
  voiceteam,
  setVoiceteam,
  rounds,
  setRounds,
}: {
  voiceteam: VoiceteamEvent;
  setVoiceteam: React.Dispatch<React.SetStateAction<VoiceteamEvent>>;
  rounds: Round[];
  setRounds: React.Dispatch<React.SetStateAction<Round[]>>;
}) {
  const [roundDialogOpen, setRoundDialogOpen] = useState(false);
  const [newRound, setNewRound] = useState({} as Round);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const addChallengeOpen = useMemo(() => Boolean(anchorEl), [anchorEl]);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const hotRef = useRef<HotTableClass>(null);

  const challenges = useMemo(() => {
    return rounds.flatMap(
      (round) =>
        round.challenges?.map((challenge) => ({
          round_number: round.number,
          ...challenge,
        })) ?? []
    );
  }, [rounds]);

  const addRound = useCallback(async () => {
    console.log({ newRound });
    try {
      const roundId = await createUpdateRound({
        voiceteam_event_id: voiceteam.voiceteam_event_id,
        ...newRound,
      });
      setRounds((prev) => [
        ...prev,
        {
          round_id: roundId,
          voiceteam_event_id: voiceteam.voiceteam_event_id,
          ...newRound,
          challenges: [],
        },
      ]);
      setNewRound({} as Round);
      setRoundDialogOpen(false);
    } catch (e) {
      console.error('Error adding round:', e);
    }
  }, [voiceteam.voiceteam_event_id, newRound]);

  const addChallenge = (roundNumber) => {
    console.log(`adding challenge for round ${roundNumber}`);
    setRounds((prev) =>
      prev.map((round) =>
        round.number === roundNumber
          ? {
              ...round,
              challenges: [
                ...round.challenges,
                {
                  round_id: round.round_id,
                  created_at: new Date(),
                } as Challenge,
              ],
            }
          : round
      )
    );
  };

  const handleChallengeCellChange = (changes: CellChange<any>[]) => {
    console.log({ changes });
    changes.forEach((change) => {
      const roundNumber = parseInt(
        change.rowId.toString().match(/round-(\d)/)[1]
      );
      console.log({ roundNumber });
      const challengeIndex = parseInt(
        change.rowId.toString().match(/challenge-(\d)/)[1]
      );
      console.log({ challengeIndex });
      const round = rounds.find((round) => round.number === roundNumber);
      console.log({ round });
      console.log(change.newCell.type === 'number');
      const challenges = round.challenges.map((challenge, i) =>
        i === challengeIndex
          ? {
              ...challenge,
              [change.columnId]:
                change.newCell.type === 'number'
                  ? change.newCell.value
                  : change.newCell.text,
            }
          : challenge
      );
      console.log({ challenges });
      setRounds((prev) =>
        prev.map((round) =>
          round.number === roundNumber
            ? {
                ...round,
                challenges: challenges.map((challenge, i) =>
                  i === challengeIndex
                    ? {
                        ...challenge,
                        [change.columnId]:
                          change.newCell.type === 'number'
                            ? change.newCell.value
                            : change.newCell.text,
                      }
                    : challenge
                ),
              }
            : round
        )
      );
    });
  };

  const updateChallenges = useCallback((changeArray) => {
    // get round number
    // get round
    // update challenge in that round
    // change is of shape [rowIndex, columnName, oldValue, newValue]
    const challenge = challenges[changeArray[0]];
    const round = rounds.find(
      (round) => round.number === challenge.round_number
    );

    setRounds((prev) =>
      prev.map((r) =>
        r.round_id === round.round_id
          ? {
              ...r,
              challenges: r.challenges?.map((c) =>
                c.challenge_id === challenge.challenge_id
                  ? { ...c, [changeArray[1]]: changeArray[3] }
                  : c
              ),
            }
          : r
      )
    );
  }, []);

  const headerRow: Row = useMemo(
    () => ({
      rowId: 'header',
      cells: [
        { type: 'header', text: 'Rd' },
        { type: 'header', text: 'Challenge' },
        { type: 'header', text: 'Description' },
        { type: 'header', text: 'Pts' },
        { type: 'header', text: 'Bonus Pts' },
      ],
    }),
    []
  );

  // TODO: strong top line divider in between rows? custom classes...?
  const rows: Row[] = useMemo(
    () => [
      headerRow,
      ...(rounds ?? []).flatMap<Row>((round) => {
        // TODO: header row that just has the name of the round?
        const challengeRows =
          round.challenges?.map<Row>((challenge, i) => ({
            rowId: `round-${round.number}-challenge-${i}`,
            key: challenge.challenge_id,
            // height: 100,
            cells: [
              {
                type: 'text',
                text: round.number?.toString() ?? '',
                nonEditable: true,
              },
              // and then like making that??? the description i mean
              // anyways the tooltip does NOT work very well i should look up better how to do a custom modal like that
              {
                type: 'text',
                text: challenge.name ?? '',
                // TODO: custom to make text bigger?
                renderer: (text) => (
                  <Tooltip title={challenge.description} placement='right-end'>
                    <span>{text}</span>
                  </Tooltip>
                ),
                // renderer: (text) => (
                //   <DescriptionCell
                //     text={text}
                //     description={challenge.description ?? ''}
                //   />
                // ),
              },
              {
                type: 'text',
                text: challenge.description ?? '',
                // style: { overflow: 'visible' },
                // className: vtStyles.wrapText,
                // renderer: (text) => (
                //   <span className={vtStyles.wrapText}>{text}</span>
                // ),
              },
              { type: 'number', value: challenge.points ?? null },
              { type: 'number', value: challenge.bonus_points ?? null },
            ],
          })) ?? [];
        return challengeRows;
        // return {
        //   rowId: round.round_id,
        //   cells: [
        //     { type: 'text', text: round.number?.toString() ?? '' },
        //     { type: 'text', text: 'figure out challenges' },
        //   ],
        // };
      }),
    ],
    [headerRow, rounds]
  );

  // TODO: capitalize name of bonus
  // TODO: how to make non editable
  const bonusRows: Row[] = [
    {
      rowId: 'header',
      cells: Object.keys(voiceteam.bonus_values ?? {}).map((key) => ({
        type: 'header',
        text: String(key).charAt(0).toUpperCase() + String(key).slice(1),
      })),
    },
    {
      rowId: 'values',
      cells: Object.values(voiceteam.bonus_values ?? {}).map((value) => ({
        type: 'number',
        value: value,
        nonEditable: true,
      })),
    },
  ];

  const columns: Column[] = [
    { columnId: 'Rd', width: 100 },
    { columnId: 'name', width: 400 },
    { columnId: 'description', resizable: true, width: 200 },
    { columnId: 'points', width: 50 },
    { columnId: 'bonus_points', width: 50 },
  ];

  const bonusColumns: Column[] = Object.keys(voiceteam.bonus_values ?? {}).map(
    (key) => ({ columnId: key, width: 100 })
  );

  // TODO: convert to HOT?
  return (
    <div>
      <Dialog open={roundDialogOpen} onClose={() => setRoundDialogOpen(false)}>
        <DialogTitle>Add Round</DialogTitle>
        <DialogContent>
          <div style={{ marginTop: '2rem' }}>
            <TextField
              size='small'
              label='Name'
              value={newRound.name ?? ''}
              onChange={(e) =>
                setNewRound((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <TextField
              size='small'
              label='Num'
              value={newRound.number?.toString() ?? ''}
              onChange={(e) =>
                setNewRound((prev) => ({
                  ...prev,
                  number: isNaN(parseInt(e.target.value))
                    ? null
                    : parseInt(e.target.value),
                }))
              }
            />
            <FormControlLabel
              label='Points break?'
              control={
                <Checkbox
                  checked={newRound.points_break}
                  onChange={(e) =>
                    setNewRound((prev) => ({
                      ...prev,
                      points_break: e.target.checked,
                    }))
                  }
                />
              }
            />
            <TextField
              size='small'
              type='datetime-local'
              label='Deadline'
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              value={newRound.deadline ?? ''}
              onChange={(e) =>
                setNewRound((prev) => ({ ...prev, deadline: e.target.value }))
              }
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoundDialogOpen(false)}>Cancel</Button>
          <Button onClick={addRound} variant='contained'>
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Button
        onClick={() => setRoundDialogOpen(true)}
        variant='contained'
        startIcon={<Add />}
      >
        Add Round
      </Button>
      {/* <Button onClick={addChallenge} variant='contained' startIcon={<Add />}>
        Add Challenge
      </Button> */}
      <Button
        variant='contained'
        startIcon={<Add />}
        id='add-challenge-button'
        aria-controls={addChallengeOpen ? 'basic-menu' : undefined}
        aria-haspopup={true}
        aria-expanded={addChallengeOpen ? 'true' : undefined}
        onClick={handleClick}
      >
        Add Challenge
      </Button>
      <Menu
        id='add-challenge-menu'
        anchorEl={anchorEl}
        open={addChallengeOpen}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'add-challenge-button',
        }}
      >
        {rounds.map((round) => (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              addChallenge(round.number);
              handleClose();
            }}
            key={round.round_id}
          >
            {round.number}
          </MenuItem>
        ))}
      </Menu>
      {/* <Button onClick={() => console.log(data)} variant='contained'>
        log data
      </Button> */}
      <Button onClick={() => console.log(rounds)} variant='contained'>
        rounds
      </Button>
      <Button onClick={() => console.log(rows)} variant='contained'>
        rows
      </Button>
      <HotTable
        data={challenges}
        ref={hotRef}
        licenseKey='non-commercial-and-evaluation'
        // className={tableStyles.arial}
        colHeaders={['Rd', 'Challenge', 'Description', 'Pts', '+', 'Bonus Pts']}
        columns={[
          { type: 'text', data: 'round_number' },
          { type: 'text', data: 'name' },
          { type: 'text', data: 'description', width: 400 },
          { type: 'numeric', data: 'points' },
          { type: 'checkbox', data: 'bonus_is_additional' },
          { type: 'numeric', data: 'bonus_points' },
        ]}
      />
      <div className={styles.flexRow}>
        <ReactGrid
          rows={rows}
          columns={columns}
          onCellsChanged={handleChallengeCellChange}
        />
        <ReactGrid rows={bonusRows} columns={bonusColumns} />
      </div>
    </div>
  );
}
