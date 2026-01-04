import { useMemo } from 'react';
import styles from './ui.module.css';
import {
  AuthorPermissionStatus,
  PartStatus,
  PermissionAskStatus,
  PodficStatus,
} from '../types';
import Link from 'next/link';

interface StatusBadgeProps {
  status:
    | PodficStatus
    | AuthorPermissionStatus
    | PermissionAskStatus
    | PartStatus;
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
      case PermissionAskStatus.ASKED:
        return styles.Asked;
      case PermissionAskStatus.YES:
        return styles.Permission;
      case PermissionAskStatus.COLLAB:
        return styles.Collab;
      case PermissionAskStatus.GHOSTED:
        return styles.Ghosted;
      case PermissionAskStatus.TO_ASK:
        return styles.ToAsk;
      case PermissionAskStatus.TO_ASK_FIRST:
        return styles.ToAskFirst;
      case PermissionAskStatus.NO:
        return styles.No;
      case AuthorPermissionStatus.BP:
        return styles.BP;
      case AuthorPermissionStatus.PERMISSION:
        return styles.Permission;
      case PartStatus.PICKED:
        return styles.Picked;
      case AuthorPermissionStatus.ASK_FIRST:
        return styles.AskFirst;
      case AuthorPermissionStatus.FRIENDLY:
        return styles.Friendly;
      case AuthorPermissionStatus.UNKNOWN:
        return styles.Unknown;
      case AuthorPermissionStatus.INACTIVE:
        return styles.Inactive;
      case PartStatus.EDITED:
      case PartStatus.SUBMITTED:
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
        <Link href={linkTo} className={styles.invisibleLink}>
          {status}
        </Link>
      ) : (
        status
      )}
    </div>
  );
}
