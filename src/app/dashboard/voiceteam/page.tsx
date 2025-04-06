import { fetchVoiceteams } from '@/app/lib/loaders';
import Link from 'next/link';

export default async function Page() {
  const voiceteams = await fetchVoiceteams();

  return (
    <div>
      {voiceteams?.map((vt) => (
        <>
          <Link href={`/dashboard/voiceteam/${vt.event_id}`}>
            {`${vt.name} ${vt.year}`}
          </Link>
          <br />
        </>
      ))}
    </div>
  );
}
