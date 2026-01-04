import { Metadata } from 'next';
import VoiceteamPage from './VoiceteamPage';

export const metadata: Metadata = {
  title: 'Voiceteam Page',
};

export default function Page({ params }: { params: { id: any } }) {
  return <VoiceteamPage voiceteamId={params.id} />;
}
