import { getClient } from '@/app/lib/db-helpers';
import { NextRequest, NextResponse } from 'next/server';

// TODO: this is a separate event id one
export async function GET(
  _request: NextRequest,
  context: { params: { id: any } }
) {
  const id = context.params.id;

  console.log({ id });

  const client = await getClient();
  const voiceteamEventId = (
    await client.query(
      `select voiceteam_event_id from voiceteam_event where event_id = $1`,
      [id]
    )
  ).rows[0]?.voiceteam_event_id;
  console.log({ voiceteamEventId });
  const challengeResult = await client.query(
    `select *,challenge.name as challenge_name from challenge inner join round on round.round_id = challenge.round_id where round.voiceteam_event_id = $1 order by challenge.created_at`,
    [voiceteamEventId]
  );
  const challenges = (challengeResult.rows ?? []) as Challenge[];
  console.log({ challenges });
  // TODO: is there a way to like do this inline in postgres??
  for (const challenge of challenges) {
    const projectResult = await client.query(
      `select vt_project_id, challenge_id, name, link, length from vt_project where challenge_id = $1`,
      [challenge.challenge_id]
    );
    challenge.projects =
      projectResult.rows?.map((project) => ({
        ...project,
        challenge_name: challenge.name,
        challenge_created: challenge.created_at,
      })) ?? [];
  }
  return NextResponse.json(challenges);
}
