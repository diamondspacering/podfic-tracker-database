import { useEffect } from 'react';

interface ProjectPointsCellProps {
  value: number;
  setValue: (value: number) => void;
  project: Project;
  points_cap: number;
  length_bonus_options: object;
  bonus_values: object;
  challenge: Challenge;
}

export default function ProjectPointsCell({
  value,
  setValue,
  project,
  points_cap,
  length_bonus_options,
  bonus_values,
  challenge,
}: ProjectPointsCellProps) {
  // useEffect(() => {
  //   console.log('setting value');
  //   console.log({ challenge });
  //   setValue(challenge.points);
  // }, [setValue, challenge, project.challenge_id]);
  useEffect(() => {
    console.log('setting value');
    console.log({ challenge });
    console.log({ project });
    setValue(challenge.points);
  }, [challenge, value, project]);

  return <span>{value}</span>;
}
