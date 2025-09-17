import { Suspense } from 'react';
import HtmlPage from './HtmlPage';

export default function Page() {
  return (
    <Suspense>
      <HtmlPage />
    </Suspense>
  );
}
