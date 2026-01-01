import { Suspense } from 'react';
import HtmlPage from './HtmlPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HTML Generation',
};

export default function Page() {
  return (
    <Suspense>
      <HtmlPage />
    </Suspense>
  );
}
