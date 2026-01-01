import { Metadata } from 'next';
import PodficFormPage from '../PodficFormPage';

export const metadata: Metadata = {
  title: 'New Podfic',
};

export default function Page({ searchParams }: { searchParams?: any }) {
  return <PodficFormPage returnUrl={searchParams?.return_url} />;
}
