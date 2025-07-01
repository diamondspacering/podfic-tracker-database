enum PodficStatus {
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

enum PartStatus {
  PICKED = 'Picked',
  RECORDING = 'Recording',
  RECORDED = 'Recorded',
  EDITED = 'Edited',
  SUBMITTED = 'Submitted',
}

enum PodficType {
  PODFIC = 'podfic',
  MULTIVOICE = 'multivoice',
  META = 'meta',
  EXPERIMENTAL = 'experimental',
  NOTFIC = 'notfic',
}

type Length = {
  days?: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type PodficFull = Podfic & Work & Author & CoverArt;

// --PODFIC INFO--

interface RecordingSession {
  recording_id?: number;
  podfic_id?: number;
  chapter_id?: number;
  part_id?: number;
  length: Length;
  date?: string;
  year?: string;
  month?: string;
  mic?: string;
  device?: string;
  location?: string;
}

interface Podfic {
  podfic_id?: number;
  work_id?: number;
  status?: PodficStatus;
  is_private?: boolean;
  length?: any;
  raw_length?: any;
  plain_length?: any;
  event_id?: number;
  ao3_link?: string;
  posted_date?: string;
  posted_year?: number;
  exclude_stats?: boolean;
  type?: PodficType;
  giftee_id?: number;
  deadline?: string;
  added_date?: any;
  updated_at?: any;
  html_string: string;
  posted_unchaptered?: boolean;
  series_id?: number;
  vt_project_id?: any;
  is_multivoice: boolean;
  chapters?: Chapter[];
  parts?: Part[];
  coverArt?: CoverArt;
  podficcers?: Podficcer[];
  notes?: Note[];
  resources?: Resource[];
}

interface Chapter {
  chapter_id?: number;
  podfic_id?: number;
  link?: string;
  chapter_number?: number;
  chapter_title?: string;
  wordcount?: number;
  length?: any;
  raw_length?: any;
  plain_length?: any;
  status?: PodficStatus;
  ao3_link?: string;
  posted_date?: string;
  deadline?: string;
  updated_at?: any;
  vt_project_id?: number;
  html_string?: string;
  recording_sessions?: RecordingSession[];
  files?: File[];
  notes?: Note[];
  resources?: Resource[];
}

interface Part {
  part_id?: number;
  podfic_id?: number;
  chapter_id?: number;
  doc?: string;
  audio_link?: string;
  organizer?: number;
  words?: number;
  type?: PodficType;
  status?: PartStatus;
  length?: Length;
  raw_length?: Length;
  part?: string;
  deadline?: string;
  created_at?: any;
}

type PartWithContext = Part & Podfic & Work & Chapter & Podficcer & Event;

interface Podficcer {
  podficcer_id?: number;
  username?: string;
  name?: string;
  profile?: string;
}

interface CoverArt {
  cover_art_id?: number;
  podfic_id?: number;
  cover_artist_name?: string;
  podficcer_id?: number;
  image_link?: string;
  cover_art_status?: string;
}

interface Tag {
  tag_id?: number;
  name: string;
}

// --FIC INFO--

interface Work {
  work_id?: number;
  title: string;
  link?: string;
  nickname?: string;
  author_id?: number;
  fandom_id?: number;
  needs_update?: boolean;
  wordcount: number | string;
  chaptered?: boolean;
  chapter_count?: number;
  rating?: string;
  category?: string;
  relationship?: string;
  main_character?: string;
  series?: string;
  username?: string;
  permission_status?: PermissionStatus;
}

interface Series {
  series_id?: number;
  name?: string;
  series_link?: number;
}

enum PermissionStatus {
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

// TODO: what if the social media was a JSON w/ different sites......much to think on....
interface Author {
  author_id?: number;
  username: string;
  ao3?: string;
  permission_status?: PermissionStatus;
  primary_social_media?: string;
  permission_ask?: string;
  asked_date?: string;
  permission_date?: string;
  resources?: Resource[];
  notes?: Note[];
}

interface Fandom {
  fandom_id?: number;
  category_id?: number;
  fandom_name: string;
}

interface FandomCategory {
  fandom_category_id?: number;
  category_name: string;
}

// --ADDITIONAL INFO--

enum FileType {
  MP3 = 'mp3',
  M4A = 'm4a',
  ZIP = 'zip',
  M4B = 'm4b',
}

interface File {
  file_id?: number;
  podfic_id?: number;
  chapter_id?: number;
  length: any;
  size?: number;
  filetype?: FileType;
  label?: string;
  is_plain?: boolean;
  links?: FileLink[];
}

interface FileLink {
  file_link_id?: number;
  file_id: number;
  host?: string;
  link: string;
  is_direct?: boolean;
  is_embed?: boolean;
}

interface Resource {
  resource_id?: number;
  resource_type?: string;
  label?: string;
  link?: string;
  notes?: string;
}

interface Note {
  note_id?: number;
  podfic_id?: number;
  chapter_id?: number;
  author_id?: number;
  event_id?: number;
  label?: string;
  value: string;
}

// parent name is not in the db it's a convenience variable don't worry about my very questionable design here
interface EventParent {
  event_parent_id?: number;
  name?: string;
  parent_name?: string;
  description?: string;
  events?: Event[];
}

interface Event {
  event_id?: number;
  parent_id?: number;
  name?: string;
  event_name?: string;
  year?: string | number;
}

enum ScheduledEventType {
  PODFIC = 'Podfic',
  CHAPTER = 'Chapter',
  PART = 'Part',
  ROUND = 'Round',
}

interface ScheduleEvent {
  scheduled_event_id?: number;
  podfic_id?: number;
  chapter_id?: number;
  part_id?: number;
  round_id?: number;
  type?: ScheduledEventType;
  start?: string | Date;
  end?: string | Date;
  allDay?: boolean;

  title?: string;
  wordcount?: number;
  status?: PodficStatus;

  chapter_title?: string;
  chapter_number?: number;
  chapter_wordcount?: number;
  chapter_status?: PodficStatus;

  part?: string;
  part_wordcount?: number;
  part_status?: PartStatus;

  round_number?: number;
}

// --VOICETEAM--

interface VoiceteamEvent {
  voiceteam_event_id?: number;
  event_id?: number;
  name?: string;
  year?: number;
  type?: 'May Voiceteam' | 'Mystery Box';
  points_cap?: number;
  points_cap_options?: object;
  bonus_values?: object;
  length_bonus_options?: object;
  rounds?: Round[];
}

interface Round {
  round_id?: number;
  voiceteam_event_id?: number;
  name?: string;
  number?: number;
  total_points?: number;
  points_break?: boolean;
  deadline?: any;
  challenges?: Challenge[];
}

interface Challenge {
  challenge_id?: number;
  round_id?: number;
  round_number?: number;
  name?: string;
  challenge_name?: string;
  description?: string;
  points?: number;
  bonus_points?: number;
  bonus_is_additional?: boolean;
  created_at: any;
  projects?: Project[];
}

interface Project {
  vt_project_id?: number;
  challenge_id?: number;
  name?: string;
  notes?: string;
  link?: string;
  bonus?: boolean;
  finished?: boolean;
  submitted?: boolean;
  abandoned?: boolean;
  // TODO: we kind of want to store these points and not calculate every time; perhaps it should just be points not points_manual like it's an overwritten field
  points_manual?: integer;
  bonus_manual?: integer;
  universal_bonus?: boolean;
  project_lead_bonus?: boolean;
  byo_bonus?: boolean;
  length?: any;
  length_bonus?: string;
  created_at: any;
  challenge_name?: string;
  challenge_created?: any;
  origIndex?: number;
}
