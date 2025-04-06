'use client';

import { useVoiceteamEvent } from '@/app/lib/swrLoaders';
import { Add, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Menu,
  MenuItem,
  Tab,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  TextCell,
  Cell,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import styles from '@/app/dashboard/voiceteam/voiceteam.module.css';
import vtStyles from './voiceteam-table.module.css';
import {
  createUpdateChallenge,
  createUpdateProject,
  createUpdateRound,
} from '@/app/lib/updaters';
import { mutate } from 'swr';
import DescriptionCell from './DescriptionCell';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import VoiceteamRoundPage from './VoiceteamRoundPage';
import VoiceteamOverviewPage from './VoiceteamOverviewPage';
import 'handsontable/dist/handsontable.full.min.css';
import { registerAllModules } from 'handsontable/registry';

registerAllModules();

export default function VoiceteamPage({ voiceteamId }) {
  const { voiceteamEvent, isLoading } = useVoiceteamEvent(voiceteamId);
  const [data, setData] = useState<VoiceteamEvent>({} as VoiceteamEvent);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentTab, setCurrentTab] = useState('0');

  useEffect(() => {
    if (!isLoading) {
      setData(voiceteamEvent);
      setRounds(voiceteamEvent.rounds ?? []);
    }
  }, [isLoading, voiceteamEvent]);

  useEffect(() => console.log({ voiceteamEvent }), [voiceteamEvent]);

  // TODO: some method of updating points from here...? nah its fine
  const updateProjectData = useCallback(async (projects: Project[]) => {
    for (const project of projects) {
      await createUpdateProject(project);
    }
  }, []);

  const updateChallengeData = useCallback(async () => {
    for (const round of rounds) {
      for (const challenge of round.challenges) {
        if (challenge.projects?.length) {
          await updateProjectData(challenge.projects);
        }
        await createUpdateChallenge(challenge);
      }
    }
  }, [rounds]);

  // TODO: other round updates?
  const updateData = useCallback(async () => {
    setIsSubmitting(true);
    await updateChallengeData();
    await mutate(`/db/voiceteam/${voiceteamId}`);
    console.log('done');
    setIsSubmitting(false);
  }, [updateChallengeData, voiceteamId]);

  // TODO: have separate smaller table that display all rounds, or information about rounds similarly? figure out fancy styling later?
  return (
    <div>
      <Typography variant='h2'>{voiceteamEvent.name}</Typography>

      <br />
      <TabContext value={currentTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={(_, value) => setCurrentTab(value)}
            aria-label='voiceteam-round-tabs'
          >
            <Tab label='Overview' value='0' />
            {rounds.map((round) => (
              <Tab
                key={round.round_id}
                label={round.name}
                value={round.number?.toString()}
              />
            ))}
          </TabList>
        </Box>
        <TabPanel value='0'>
          <VoiceteamOverviewPage
            voiceteam={data}
            setVoiceteam={setData}
            rounds={rounds}
            setRounds={setRounds}
          />
        </TabPanel>
        {rounds.map((round) => (
          <TabPanel key={round.round_id} value={round.number?.toString()}>
            <VoiceteamRoundPage
              round={round}
              setRound={(newRound) =>
                setRounds((prev) =>
                  prev.map((r) =>
                    r.round_id === newRound.round_id ? newRound : r
                  )
                )
              }
              points_cap={data.points_cap ?? 0}
              // length_bonus_options={data.length_bonus_options ?? {}}
              length_bonus_options={{
                '>10m': 10,
                '>30m': 15,
                '>1h': 20,
              }}
              bonus_values={data.bonus_values ?? {}}
            />
          </TabPanel>
        ))}
      </TabContext>
      <br />
      <br />
      <LoadingButton
        variant='contained'
        startIcon={<Save />}
        loading={isSubmitting}
        onClick={updateData}
      >
        Save Data
      </LoadingButton>
    </div>
  );
}
