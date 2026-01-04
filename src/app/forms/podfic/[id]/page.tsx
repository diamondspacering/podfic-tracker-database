import { Metadata } from 'next';
import PodficFormPage from '../PodficFormPage';

export const metadata: Metadata = {
  title: 'Edit Podfic',
};

export default function Page({
  params,
  searchParams,
}: {
  params: { id: any };
  searchParams?: any;
}) {
  return (
    <PodficFormPage podficId={params.id} returnUrl={searchParams?.return_url} />
  );
}
