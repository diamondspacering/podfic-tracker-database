// import styles from './ui.module.css';

// export default function StatusBadge({ status }) {
//   return (
//     <div className={`${styles.statusBadge} ${styles[status]}`}>{status}</div>
//   );
// }

import { useMemo } from 'react';
import styles from './ui.module.css';
import { PartStatus, PermissionStatus, PodficStatus } from '../types';

interface StatusBadgeProps {
  status: PodficStatus | PermissionStatus | PartStatus;
  clickable?: boolean;
  onClick?: () => void;
  linkTo?: string;
}

export default function StatusBadge({
  status,
  clickable,
  onClick,
  linkTo,
}: StatusBadgeProps) {
  const className = useMemo(() => {
    switch (status) {
      case PodficStatus.PLANNING:
        return styles.Planning;
      case PodficStatus.RECORDING:
        return styles.Recording;
      case PodficStatus.RECORDED:
        return styles.Recorded;
      case PodficStatus.EDITING:
        return styles.Editing;
      case PodficStatus.VISUAL_EDIT:
        return styles.VisualEdit;
      case PodficStatus.FIRST_PASS:
        return styles.FirstPass;
      case PodficStatus.TAKES:
        return styles.Takes;
      case PodficStatus.PROOF_LISTEN:
        return styles.ProofListen;
      case PodficStatus.SFX_MUSIC:
        return styles.SFXMusic;
      case PodficStatus.NEEDS_RERECORD:
        return styles.NeedsRerecord;
      case PodficStatus.FINISHED:
        return styles.Finished;
      case PodficStatus.POSTING:
        return styles.Posting;
      case PodficStatus.POSTED:
        return styles.Posted;
      case PermissionStatus.ASKED:
        return styles.Asked;
      case PermissionStatus.BP:
        return styles.BP;
      case PermissionStatus.PERMISSION:
        return styles.Permission;
      case PermissionStatus.COLLAB:
        return styles.Collab;
      case PermissionStatus.GHOSTED:
        return styles.Ghosted;
      case PermissionStatus.NO:
        return styles.No;
      case PermissionStatus.TO_ASK:
        return styles.ToAsk;
      case PermissionStatus.ASK_FIRST:
        return styles.AskFirst;
      case PermissionStatus.TO_ASK_FIRST:
        return styles.ToAskFirst;
      default:
        return styles.Default;
    }
  }, [status]);

  return (
    <div
      className={`${styles.roundBadge} ${
        clickable ? styles.clickable : ''
      } ${className}`}
      onClick={onClick}
    >
      {linkTo ? (
        <a href={linkTo} className={styles.invisibleLink}>
          {status}
        </a>
      ) : (
        status
      )}
    </div>
  );
}
