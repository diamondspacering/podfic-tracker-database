import { ReactNode } from 'react';

interface ExternalLinkProps {
  href: string;
  className?: string;
  onClick?: (event: any) => void;
  children?: ReactNode | string;
}

/**
 * Custom link component that always opens in a new tab
 * @param href Link to follow
 * @param onClick onClick function, which gets entire click event, that runs separately from link-opening behavior (e.g., stopping propagation)
 */
export default function ExternalLink({
  href,
  className,
  onClick,
  children,
}: ExternalLinkProps) {
  return (
    <a
      href={href}
      className={className ? className : ''}
      onClick={(e) => {
        onClick?.(e);
      }}
      target='_blank'
    >
      {children ? children : href}
    </a>
  );
}
