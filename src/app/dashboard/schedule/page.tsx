import { Metadata } from 'next';
import SchedulePage from './SchedulePage';

export const metadata: Metadata = {
  title: 'Schedule',
};

export default function Page() {
  return <SchedulePage />;
}
