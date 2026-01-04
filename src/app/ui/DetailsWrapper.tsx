import styles from '@/app/ui/ui.module.css';
import { KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { ReactNode, useState } from 'react';

interface DetailsWrapperProps {
  className?: string;
  isDefaultOpen?: boolean;
  header?: string | ReactNode;
  children: ReactNode;
}

export default function DetailsWrapper({
  className,
  isDefaultOpen = true,
  header,
  children,
}: DetailsWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(isDefaultOpen);

  return (
    <div className={`${styles.detailsWrapper} ${className ? className : ''}`}>
      <div
        className={styles.detailsWrapperHeader}
        onClick={(e) => {
          e.stopPropagation();
          setIsExpanded((expanded) => !expanded);
        }}
      >
        <IconButton style={{ padding: '0px' }}>
          {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
        </IconButton>
        {header}
      </div>
      {isExpanded && children}
    </div>
  );
}
