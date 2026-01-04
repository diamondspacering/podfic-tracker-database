import { fetchVoiceteams } from '@/app/lib/loaders';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Voiceteams',
};

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
