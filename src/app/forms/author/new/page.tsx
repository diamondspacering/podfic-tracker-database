import { Metadata } from 'next';
import AuthorFormPage from '../author-form-page';

export const metadata: Metadata = {
  title: 'Edit Author',
};

export default function Page() {
  return <AuthorFormPage />;
}
