'use client';

import Link from 'next/link';
import styles from './dashboard.module.css';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', text: 'Home' },
  { href: '/dashboard/podfic', text: 'Podfic' },
  { href: '/dashboard/stats', text: 'Stats' },
  { href: '/dashboard/authors', text: 'Authors' },
  { href: '/dashboard/events', text: 'Events' },
  { href: '/dashboard/schedule', text: 'Schedule' },
  { href: '/dashboard/parts', text: 'Parts' },
  { href: '/dashboard/other', text: 'Other' },
  { href: '/dashboard/voiceteam', text: 'Voiceteam' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <div className={styles.headerFlex}>
      {links.map(({ href, text }) => {
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.navLink} ${
              href === pathname && styles.selected
            }`}
          >
            {text}
          </Link>
        );
      })}
    </div>
  );
}
