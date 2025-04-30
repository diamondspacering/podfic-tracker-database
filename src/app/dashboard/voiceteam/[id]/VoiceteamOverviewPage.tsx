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
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import HotTable, { HotTableClass } from '@handsontable/react';
import styles from '@/app/dashboard/dashboard.module.css';
import { useEventResources } from '@/app/lib/swrLoaders';
import AddMenu from '@/app/ui/AddMenu';
import { mutate } from 'swr';

const lengthBonusOptions = {
  '>10m': 10,
  '>30m': 15,
  '>1h': 20,
};

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
  const [anchorElBtm, setAnchorElBtm] = useState<null | HTMLElement>(null);
  const addChallengeBtmOpen = useMemo(
    () => Boolean(anchorElBtm),
    [anchorElBtm]
  );
  const handleClickBtm = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorElBtm(event.currentTarget);
  };
  const handleCloseBtm = () => {
    setAnchorElBtm(null);
  };

  const { resources } = useEventResources(voiceteam.event_id);

  const bonusData = useMemo(() => {
    return Object.entries({
      ...voiceteam.bonus_values,
      ...lengthBonusOptions,
    }).map(([key, value]) => {
      return {
        name: key,
        points: value,
      };
    });
  }, [voiceteam.bonus_values]);

  const hotRef = useRef<HotTableClass>(null);
  const bonusHotRef = useRef<HotTableClass>(null);
  const resourceHotRef = useRef<HotTableClass>(null);

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
  }, [newRound, voiceteam.voiceteam_event_id, setRounds]);

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

  const updateChallenge = (change: Array<any>) => {
    const challengeRowIndex = change[0];
    const columnName = change[1];
    const newValue = change[3];
    console.log({ challengeRowIndex, columnName, newValue });

    const challenge = challenges[challengeRowIndex];
    const roundNumber = challenge.round_number;
    setRounds((prev) =>
      prev.map((r) =>
        r.number === roundNumber
          ? {
              ...r,
              challenges: r.challenges.map((c) =>
                c.challenge_id === challenge.challenge_id
                  ? {
                      ...c,
                      [columnName]: newValue,
                    }
                  : c
              ),
            }
          : r
      )
    );
  };

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
      {/* TODO: figure out how to make these sticky instead of replicating challenge button at the bottom? */}
      <Button
        onClick={() => setRoundDialogOpen(true)}
        variant='contained'
        startIcon={<Add />}
      >
        Add Round
      </Button>
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
      <Button onClick={() => console.log(rounds)} variant='contained'>
        rounds
      </Button>
      <Button onClick={() => console.log(challenges)} variant='contained'>
        challenges
      </Button>

      <div className={styles.flexRow}>
        <HotTable
          data={challenges}
          ref={hotRef}
          licenseKey='non-commercial-and-evaluation'
          // className={tableStyles.arial}
          colHeaders={[
            'Rd',
            'Challenge',
            'Description',
            'Pts',
            '+',
            'Bonus Pts',
          ]}
          columns={[
            { type: 'text', data: 'round_number' },
            { type: 'text', data: 'name' },
            { type: 'text', data: 'description', width: 400 },
            { type: 'numeric', data: 'points' },
            { type: 'checkbox', data: 'bonus_is_additional' },
            { type: 'numeric', data: 'bonus_points' },
          ]}
          afterChange={(change) => {
            // change is of shape [rowIndex, columnName, oldValue, newValue]
            if (!!change) {
              const changeArray = change[0] as Array<any>;
              updateChallenge(changeArray);
            }
          }}
        />

        <div className={styles.flexColumn}>
          <HotTable
            data={bonusData}
            ref={bonusHotRef}
            licenseKey='non-commercial-and-evaluation'
            title='Bonus Values'
            colHeaders={['Name', 'Points']}
          />
          <br />
          <AddMenu
            eventId={voiceteam.event_id}
            options={['resource']}
            submitCallback={() =>
              mutate(
                (key) =>
                  Array.isArray(key) &&
                  key[0] === '/db/resources' &&
                  key[1] === voiceteam.event_id
              )
            }
          />
          <HotTable
            data={resources}
            ref={resourceHotRef}
            licenseKey='non-commercial-and-evaluation'
            title='Resources'
            colHeaders={['Type', 'Label', 'Link', 'Notes']}
            columns={[
              { type: 'text', data: 'resource_type' },
              { type: 'text', data: 'label' },
              {
                data: 'link',
                width: 50,
                autoWrapCol: false,
                allowHtml: true,
                renderer: (instance, td, row, col, prop, value) => {
                  td.innerHTML = `<span class="truncated-text"><a href="${value}" target="_blank">${value}</a></span>`;
                },
              },
              { type: 'text', data: 'notes' },
            ]}
          />
        </div>
      </div>

      <Button
        variant='contained'
        startIcon={<Add />}
        id='add-challenge-button-btm'
        aria-controls={addChallengeBtmOpen ? 'basic-menu' : undefined}
        aria-haspopup={true}
        aria-expanded={addChallengeBtmOpen ? 'true' : undefined}
        onClick={handleClickBtm}
        style={{ marginTop: '1rem' }}
      >
        Add Challenge
      </Button>
      <Menu
        id='add-challenge-menu-btm'
        anchorEl={anchorElBtm}
        open={addChallengeBtmOpen}
        onClose={handleCloseBtm}
        MenuListProps={{
          'aria-labelledby': 'add-challenge-button-btm',
        }}
      >
        {rounds.map((round) => (
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              addChallenge(round.number);
              handleCloseBtm();
            }}
            key={round.round_id}
          >
            {round.number}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
