import { Metadata } from 'next';
import AuthorTable from './AuthorTable';

export const metadata: Metadata = {
  title: 'Authors',
};

export default async function Page() {
  return (
    <div>
      <AuthorTable />
    </div>
  );
}
