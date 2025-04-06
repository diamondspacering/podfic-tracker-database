import { Roboto, Source_Code_Pro, Inconsolata } from 'next/font/google';

export const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

export const sourceCodePro = Source_Code_Pro({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-scp',
  display: 'swap',
});

export const inconsolata = Inconsolata({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-inconsolata',
  display: 'swap',
});
