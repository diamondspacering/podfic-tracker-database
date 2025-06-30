export enum PodficStatus {
  PLANNING = 'Planning',
  RECORDING = 'Recording',
  RECORDED = 'Recorded',
  EDITING = 'Editing',
  VISUAL_EDIT = 'Visual edit',
  FIRST_PASS = 'First pass',
  TAKES = 'Takes & tweaks',
  PROOF_LISTEN = 'Proof listen',
  SFX_MUSIC = 'SFX/Music',
  NEEDS_RERECORD = 'Needs re-record',
  FINISHED = 'Finished',
  POSTING = 'Posting',
  POSTED = 'Posted',
}

export const PARTIAL_STATUSES = [PodficStatus.PLANNING, PodficStatus.RECORDING];
export const COMPLETED_STATUSES = [
  PodficStatus.FINISHED,
  PodficStatus.POSTING,
  PodficStatus.POSTED,
];

export enum PartStatus {
  PICKED = 'Picked',
  RECORDING = 'Recording',
  RECORDED = 'Recorded',
  EDITED = 'Edited',
  SUBMITTED = 'Submitted',
}

export enum PermissionStatus {
  BP = 'BP',
  TO_ASK = 'to ask',
  TO_ASK_FIRST = 'to ask first',
  ASKED = 'asked',
  GHOSTED = 'ghosted',
  ASK_FIRST = 'ask first',
  PERMISSION = 'permission',
  NO = 'no',
  COLLAB = 'collab',
}

export enum PodficType {
  PODFIC = 'podfic',
  MULTIVOICE = 'multivoice',
  META = 'meta',
  EXPERIMENTAL = 'experimental',
  NOTFIC = 'notfic',
}

export enum FileType {
  MP3 = 'mp3',
  M4A = 'm4a',
  ZIP = 'zip',
  M4B = 'm4b',
}

export const getDefaultLength = () => {
  return { hours: null, minutes: null, seconds: null };
};

export const getDefaultFile = (existingLength?: Length) => {
  return {
    label: '',
    size: null,
    length: existingLength ?? getDefaultLength(),
    filetype: FileType.MP3,
  } as File;
};

export const getEmptyLength = () => {
  return { hours: 0, minutes: 0, seconds: 0 };
};

export enum FilterType {
  STATUS = 'status',
  PERMISSION = 'permission',
  PART_STATUS = 'part_status',
  TYPE = 'type',
  DATE = 'date',
  STRING = 'string',
  NUMBER = 'number',
}

export enum ScheduledEventType {
  PODFIC = 'Podfic',
  CHAPTER = 'Chapter',
  PART = 'Part',
  ROUND = 'Round',
}
