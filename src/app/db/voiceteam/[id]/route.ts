import { getClient } from '@/app/lib/db-helpers';
import { getLengthText } from '@/app/lib/format';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  const client = await getClient();
  const voiceteamResult = await client.query(
    `select * from voiceteam_event where event_id = $1`,
    [id]
  );
  const voiceteam = voiceteamResult.rows[0] as VoiceteamEvent;

  const voiceteamEventId = voiceteam.voiceteam_event_id;
  const roundResult = await client.query(
    `select * from round where voiceteam_event_id = $1 order by number`,
    [voiceteamEventId]
  );
  const rounds = (roundResult.rows ?? []) as Round[];

  for (const round of rounds) {
    const roundId = round.round_id;
    const challengeResult = await client.query(
      `select * from challenge where round_id = $1 order by created_at`,
      [roundId]
    );
    const challenges = (challengeResult.rows ?? []) as Challenge[];
    for (const challenge of challenges) {
      const projectResult = await client.query(
        `select * from vt_project where challenge_id = $1 order by created_at`,
        [challenge.challenge_id]
      );
      challenge.projects =
        projectResult.rows?.map((row, i) => ({
          ...row,
          challenge_name: challenge.name,
          origIndex: i,
          length: getLengthText(row.length),
        })) ?? [];
    }
    round.challenges = challenges;
  }

  voiceteam.rounds = rounds;

  return NextResponse.json(voiceteam ?? {});
}
