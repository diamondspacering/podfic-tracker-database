'use client';

import { useVoiceteamEvent } from '@/app/lib/swrLoaders';
import { Save } from '@mui/icons-material';
import { Box, Tab, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import '@silevis/reactgrid/styles.css';
import { createUpdateChallenge, createUpdateProject } from '@/app/lib/updaters';
import { mutate } from 'swr';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import VoiceteamRoundPage from './VoiceteamRoundPage';
import VoiceteamOverviewPage from './VoiceteamOverviewPage';
import 'handsontable/dist/handsontable.full.min.css';
import { registerAllModules } from 'handsontable/registry';
import { useRouter, useSearchParams } from 'next/navigation';

registerAllModules();

export default function VoiceteamPage({ voiceteamId }) {
  const { voiceteamEvent, isLoading } = useVoiceteamEvent(voiceteamId);
  const [data, setData] = useState<VoiceteamEvent>({} as VoiceteamEvent);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentTab, setCurrentTab] = useState('0');

  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('round');

  useEffect(() => setCurrentTab(tabParam ?? '0'), []);

  const setRoundParam = useCallback(
    (roundNum: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('round', roundNum.toString());

      router.replace(
        `/dashboard/voiceteam/${voiceteamId}?${params.toString()}`
      );
    },
    [searchParams, router, voiceteamId]
  );

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

  return (
    <div>
      <Typography variant='h2'>{voiceteamEvent.name}</Typography>

      <br />
      <TabContext value={currentTab}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList
            onChange={(_, value) => {
              setCurrentTab(value);
              setRoundParam(value);
            }}
            aria-label='voiceteam-round-tabs'
          >
            {/* oh no u put the onclick here or in the tab list pls,, hold */}
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
              eventId={data.event_id}
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
