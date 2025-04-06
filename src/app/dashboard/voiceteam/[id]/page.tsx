import VoiceteamPage from './VoiceteamPage';

export default function Page({ params }: { params: { id: any } }) {
  return <VoiceteamPage voiceteamId={params.id} />;
}
