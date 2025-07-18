import { useMemo } from 'react';
import { Rating } from '../types';
import styles from './ui.module.css';

interface RatingBadgeProps {
  rating: Rating;
  showFullRating?: boolean;
}

export default function RatingBadge({
  rating,
  showFullRating,
}: RatingBadgeProps) {
  const className = useMemo(() => {
    switch (rating) {
      case Rating.GEN:
        return styles.Gen;
      case Rating.TEEN:
        return styles.Teen;
      case Rating.MATURE:
        return styles.Mature;
      case Rating.EXPLICIT:
        return styles.Explicit;
      case Rating.NOT_RATED:
        return styles.NotRated;
    }
  }, [rating]);

  return (
    <div className={`${styles.roundBadge} ${className}`}>
      {showFullRating ? rating : rating?.slice(0, 1)}
    </div>
  );
}
