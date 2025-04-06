import styles from './voiceteam-table.module.css';

export default function DescriptionCell({ text, description }) {
  return (
    // TODO: the lil guy in the corner
    <div className={styles.tooltip}>
      <span>{text}</span>
      <span className={`${styles.tooltiptext} ${styles.left}`}>
        {description}
      </span>
    </div>
  );
}
