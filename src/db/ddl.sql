create sequence public.author_podficcer_id_seq
    as integer;

alter sequence public.author_podficcer_id_seq owner to "podfic-tracker-db_owner";

create sequence public.cover_art_podfic_id_seq
    as integer;

alter sequence public.cover_art_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.cover_art_podficcer_id_seq
    as integer;

alter sequence public.cover_art_podficcer_id_seq owner to "podfic-tracker-db_owner";

create sequence public.file_podfic_id_seq
    as integer;

alter sequence public.file_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.note_author_id_seq
    as integer;

alter sequence public.note_author_id_seq owner to "podfic-tracker-db_owner";

create sequence public.note_event_id_seq
    as integer;

alter sequence public.note_event_id_seq owner to "podfic-tracker-db_owner";

create sequence public.note_podfic_id_seq
    as integer;

alter sequence public.note_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.part_chapter_id_seq
    as integer;

alter sequence public.part_chapter_id_seq owner to "podfic-tracker-db_owner";

create sequence public.podfic_event_id_seq
    as integer;

alter sequence public.podfic_event_id_seq owner to "podfic-tracker-db_owner";

create sequence public.podfic_giftee_id_seq
    as integer;

alter sequence public.podfic_giftee_id_seq owner to "podfic-tracker-db_owner";

create sequence public.podfic_work_id_seq
    as integer;

alter sequence public.podfic_work_id_seq owner to "podfic-tracker-db_owner";

create sequence public.recording_session_podfic_id_seq
    as integer;

alter sequence public.recording_session_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.schedule_event_chapter_id_seq
    as integer;

alter sequence public.schedule_event_chapter_id_seq owner to "podfic-tracker-db_owner";

create sequence public.schedule_event_podfic_id_seq
    as integer;

alter sequence public.schedule_event_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.work_author_id_seq
    as integer;

alter sequence public.work_author_id_seq owner to "podfic-tracker-db_owner";

create sequence public.work_fandom_id_seq
    as integer;

alter sequence public.work_fandom_id_seq owner to "podfic-tracker-db_owner";

create type public.scheduleeventtype as enum ('Podfic', 'Chapter', 'Part', 'Round');

alter type public.scheduleeventtype owner to "podfic-tracker-db_owner";

create type public.sectiontype as enum ('default', 'single-to-multiple', 'multiple-to-single', 'chapters-split', 'chapters-combine');

alter type public.sectiontype owner to "podfic-tracker-db_owner";

create table public.event_parent
(
    event_parent_id serial
        constraint event_parent_pk
            primary key,
    name            varchar(200) not null,
    description     text
);

alter table public.event_parent
    owner to "podfic-tracker-db_owner";

create table public.event
(
    event_id  serial
        constraint event_pk
            primary key,
    parent_id integer
        constraint event_event_parent_event_parent_id_fk
            references public.event_parent,
    name      varchar(200),
    year      integer
);

alter table public.event
    owner to "podfic-tracker-db_owner";

create unique index event_event_id_uindex
    on public.event (event_id);

create unique index event_parent_event_parent_id_uindex
    on public.event_parent (event_parent_id);

create table public.fandom_category
(
    fandom_category_id serial
        constraint fandom_category_pk
            primary key,
    name               varchar(200) not null
);

alter table public.fandom_category
    owner to "podfic-tracker-db_owner";

create table public.fandom
(
    fandom_id   serial
        constraint fandom_pk
            primary key,
    category_id integer
        constraint fandom_fandom_category_fandom_category_id_fk
            references public.fandom_category,
    name        varchar(200) not null
);

alter table public.fandom
    owner to "podfic-tracker-db_owner";

create unique index fandom_fandom_id_uindex
    on public.fandom (fandom_id);

create unique index fandom_category_fandom_category_id_uindex
    on public.fandom_category (fandom_category_id);

create table public.podficcer
(
    podficcer_id serial
        constraint podficcer_pk
            primary key,
    username     varchar(200),
    name         varchar(200),
    profile      varchar(200)
);

alter table public.podficcer
    owner to "podfic-tracker-db_owner";

create table public.author
(
    author_id            serial
        constraint author_pk
            primary key,
    username             varchar(200) not null,
    ao3                  varchar(200),
    permission_status    varchar(50),
    primary_social_media varchar(200),
    permission_ask       varchar(200),
    podficcer_id         integer
        constraint author_podficcer_podficcer_id_fk
            references public.podficcer,
    asked_date           date,
    permission_date      date
);

alter table public.author
    owner to "podfic-tracker-db_owner";

create unique index author_author_id_uindex
    on public.author (author_id);

create table public.resource
(
    resource_id   serial
        constraint resource_pk
            primary key,
    label         varchar(200),
    link          varchar(200),
    notes         text,
    link_label    text,
    resource_type text not null
);

alter table public.resource
    owner to "podfic-tracker-db_owner";

create unique index resource_resource_id_uindex
    on public.resource (resource_id);

create table public.resource_author
(
    resource_id serial
        constraint resource_author_resource_resource_id_fk
            references public.resource,
    author_id   integer not null
        constraint resource_author_author_author_id_fk
            references public.author,
    constraint resource_author_pk
        primary key (resource_id, author_id)
);

alter table public.resource_author
    owner to "podfic-tracker-db_owner";

create table public.resource_event
(
    resource_id integer not null
        constraint resource_event_resource_resource_id_fk
            references public.resource,
    event_id    integer not null
        constraint resource_event_event_event_id_fk
            references public.event,
    constraint resource_event_pk
        primary key (resource_id, event_id)
);

alter table public.resource_event
    owner to "podfic-tracker-db_owner";

create table public.series
(
    series_id   serial
        constraint series_pk
            primary key,
    name        varchar(200),
    series_link varchar(200)
);

alter table public.series
    owner to "podfic-tracker-db_owner";

create unique index series_series_id_uindex
    on public.series (series_id);

create table public.tag
(
    tag_id serial
        constraint tag_pk
            primary key,
    tag    text not null
);

alter table public.tag
    owner to "podfic-tracker-db_owner";

create table public."user"
(
    id                text                                not null
        primary key,
    name              text                                not null,
    email             text                                not null
        unique,
    "emailVerified"   boolean                             not null,
    image             text,
    "createdAt"       timestamp default CURRENT_TIMESTAMP not null,
    "updatedAt"       timestamp default CURRENT_TIMESTAMP not null,
    username          text
        unique,
    "displayUsername" text
);

alter table public."user"
    owner to "podfic-tracker-db_owner";

create table public.account
(
    id                      text      not null
        primary key,
    "accountId"             text      not null,
    "providerId"            text      not null,
    "userId"                text      not null
        references public."user"
            on delete cascade,
    "accessToken"           text,
    "refreshToken"          text,
    "idToken"               text,
    "accessTokenExpiresAt"  timestamp,
    "refreshTokenExpiresAt" timestamp,
    scope                   text,
    password                text,
    "createdAt"             timestamp not null,
    "updatedAt"             timestamp not null
);

alter table public.account
    owner to "podfic-tracker-db_owner";

create table public.session
(
    id          text      not null
        primary key,
    "expiresAt" timestamp not null,
    token       text      not null
        unique,
    "createdAt" timestamp not null,
    "updatedAt" timestamp not null,
    "ipAddress" text,
    "userAgent" text,
    "userId"    text      not null
        references public."user"
            on delete cascade
);

alter table public.session
    owner to "podfic-tracker-db_owner";

create table public.verification
(
    id          text      not null
        primary key,
    identifier  text      not null,
    value       text      not null,
    "expiresAt" timestamp not null,
    "createdAt" timestamp default CURRENT_TIMESTAMP,
    "updatedAt" timestamp default CURRENT_TIMESTAMP
);

alter table public.verification
    owner to "podfic-tracker-db_owner";

create table public.voiceteam_event
(
    voiceteam_event_id serial
        constraint voiceteam_event_pk
            primary key,
    event_id           integer
        constraint voiceteam_event_event_event_id_fk
            references public.event,
    name               varchar(200),
    year               integer,
    type               varchar(200),
    points_cap         integer,
    points_cap_options jsonb,
    bonus_values       jsonb
);

alter table public.voiceteam_event
    owner to "podfic-tracker-db_owner";

create table public.resource_voiceteam_event
(
    resource_id        integer not null
        constraint resource_voiceteam_event_resource_resource_id_fk
            references public.resource,
    voiceteam_event_id integer not null
        constraint resource_voiceteam_event_voiceteam_event_voiceteam_event_id_fk
            references public.voiceteam_event,
    constraint resource_voiceteam_event_pk
        primary key (voiceteam_event_id, resource_id)
);

alter table public.resource_voiceteam_event
    owner to "podfic-tracker-db_owner";

create table public.round
(
    round_id           serial
        constraint round_pk
            primary key,
    voiceteam_event_id integer
        constraint round_voiceteam_event_voiceteam_event_id_fk
            references public.voiceteam_event,
    name               text,
    number             integer,
    total_points       integer,
    points_break       boolean,
    deadline           timestamp with time zone
);

alter table public.round
    owner to "podfic-tracker-db_owner";

create table public.challenge
(
    challenge_id        serial
        constraint challenge_pk
            primary key,
    round_id            integer
        constraint challenge_round_round_id_fk
            references public.round,
    name                text,
    description         text,
    points              integer,
    bonus_points        integer,
    created_at          timestamp with time zone,
    bonus_is_additional boolean
);

alter table public.challenge
    owner to "podfic-tracker-db_owner";

create table public.vt_project
(
    vt_project_id      serial
        constraint vt_project_pk
            primary key,
    challenge_id       integer
        constraint vt_project_challenge_challenge_id_fk
            references public.challenge,
    name               text,
    notes              text,
    link               text,
    bonus              boolean,
    finished           boolean,
    submitted          boolean,
    abandoned          boolean,
    points_manual      integer,
    universal_bonus    boolean,
    project_lead_bonus boolean,
    length             interval,
    length_bonus       text,
    bonus_manual       integer,
    created_at         timestamp with time zone,
    byo_bonus          boolean
);

alter table public.vt_project
    owner to "podfic-tracker-db_owner";

create table public.work
(
    work_id        serial
        constraint work_pk
            primary key,
    title          varchar(200) not null,
    link           varchar(200),
    author_id      integer
        constraint work_author_author_id_fk
            references public.author,
    fandom_id      integer
        constraint work_fandom_fandom_id_fk
            references public.fandom,
    needs_update   boolean,
    wordcount      integer,
    chaptered      boolean,
    chapter_count  integer,
    rating         varchar(20),
    category       varchar(20),
    relationship   varchar(200),
    main_character varchar(200),
    nickname       varchar(200)
);

alter table public.work
    owner to "podfic-tracker-db_owner";

create table public.permission
(
    permission_id     serial
        constraint permission_pk
            primary key,
    asked_date        date,
    response_date     date,
    permission_status varchar(50),
    ask_link          varchar(200),
    ask_medium        varchar(200),
    work_id           integer
        constraint permission_work_work_id_fk
            references public.work,
    author_id         integer not null
        constraint permission_author_author_id_fk
            references public.author
);

alter table public.permission
    owner to "podfic-tracker-db_owner";

create table public.podfic
(
    podfic_id     serial
        constraint podfic_pk
            primary key,
    work_id       integer
        constraint podfic_work_work_id_fk
            references public.work,
    status        varchar(20)                                not null,
    is_private    boolean,
    length        interval,
    raw_length    interval,
    event_id      integer
        constraint podfic_event_event_id_fk
            references public.event,
    ao3_link      varchar(200),
    posted_date   date,
    exclude_stats boolean,
    type          varchar(20),
    giftee_id     integer
        constraint podfic_podficcer_podficcer_id_fk
            references public.podficcer,
    deadline      timestamp with time zone,
    added_date    timestamp with time zone,
    posted_year   integer,
    plain_length  interval,
    updated_at    timestamp with time zone,
    series_id     integer
        constraint podfic_series_series_id_fk
            references public.series,
    vt_project_id integer
        constraint podfic_vt_project_vt_project_id_fk
            references public.vt_project,
    is_multivoice boolean,
    section_type  sectiontype default 'default'::sectiontype not null,
    self_posted   boolean     default true
);

alter table public.podfic
    owner to "podfic-tracker-db_owner";

alter sequence public.podfic_event_id_seq owned by public.podfic.event_id;

alter sequence public.podfic_giftee_id_seq owned by public.podfic.giftee_id;

alter sequence public.podfic_work_id_seq owned by public.podfic.work_id;

create table public.chapter
(
    chapter_id     serial
        constraint chapter_pk
            primary key,
    podfic_id      integer
        constraint chapter_podfic_podfic_id_fk
            references public.podfic,
    link           varchar(200),
    chapter_number integer,
    chapter_title  varchar(200),
    wordcount      integer,
    plain_length   interval,
    html_string    text,
    updated_at     timestamp with time zone
);

alter table public.chapter
    owner to "podfic-tracker-db_owner";

create unique index chapter_chapter_id_uindex
    on public.chapter (chapter_id);

create table public.cover_art
(
    cover_art_id      serial
        constraint cover_art_pk
            primary key,
    podfic_id         integer
        constraint cover_art_podfic_podfic_id_fk
            references public.podfic,
    cover_artist_name varchar(20),
    podficcer_id      integer
        constraint cover_art_podficcer_podficcer_id_fk
            references public.podficcer,
    image_link        varchar(200),
    status            varchar(20),
    chapter_id        integer
        constraint cover_art_chapter_chapter_id_fk
            references public.chapter
);

alter table public.cover_art
    owner to "podfic-tracker-db_owner";

alter sequence public.cover_art_podfic_id_seq owned by public.cover_art.podfic_id;

alter sequence public.cover_art_podficcer_id_seq owned by public.cover_art.podficcer_id;

create unique index cover_art_cover_art_id_uindex
    on public.cover_art (cover_art_id);

create table public.part
(
    part_id    serial
        constraint part_pk
            primary key,
    podfic_id  integer
        constraint part_podfic_podfic_id_fk
            references public.podfic,
    organizer  integer
        constraint part_podficcer_podficcer_id_fk
            references public.podficcer,
    type       text,
    part       text,
    chapter_id integer
        constraint part_chapter_chapter_id_fk
            references public.chapter,
    deadline   timestamp with time zone,
    created_at timestamp with time zone,
    audio_link text,
    status     varchar(20)
);

alter table public.part
    owner to "podfic-tracker-db_owner";

alter sequence public.part_chapter_id_seq owned by public.part.chapter_id;

create unique index podfic_podfic_id_uindex
    on public.podfic (podfic_id);

create table public.podfic_podficcer
(
    podfic_id    serial
        constraint podfic_podficcer_podfic_podfic_id_fk
            references public.podfic,
    podficcer_id integer not null
        constraint podfic_podficcer_podficcer_podficcer_id_fk
            references public.podficcer,
    constraint podfic_podficcer_id
        primary key (podfic_id, podficcer_id)
);

alter table public.podfic_podficcer
    owner to "podfic-tracker-db_owner";

create table public.resource_podfic
(
    resource_id serial
        constraint resource_podfic_resource_resource_id_fk
            references public.resource,
    podfic_id   integer not null
        constraint resource_podfic_podfic_podfic_id_fk
            references public.podfic,
    constraint resource_podfic_pk
        primary key (resource_id, podfic_id)
);

alter table public.resource_podfic
    owner to "podfic-tracker-db_owner";

create table public.schedule_event
(
    schedule_event_id serial
        constraint schedule_event_pk
            primary key,
    podfic_id         integer
        constraint schedule_event_podfic_podfic_id_fk
            references public.podfic,
    chapter_id        integer
        constraint schedule_event_chapter_chapter_id_fk
            references public.chapter,
    title             text,
    start             timestamp with time zone,
    "end"             timestamp with time zone,
    allday            boolean not null,
    part_id           integer
        constraint schedule_event_part_part_id_fk
            references public.part,
    round_id          integer
        constraint schedule_event_round_round_id_fk
            references public.round,
    type              scheduleeventtype
);

alter table public.schedule_event
    owner to "podfic-tracker-db_owner";

alter sequence public.schedule_event_chapter_id_seq owned by public.schedule_event.chapter_id;

alter sequence public.schedule_event_podfic_id_seq owned by public.schedule_event.podfic_id;

create table public.section
(
    section_id   serial
        constraint section_pk
            primary key,
    podfic_id    integer not null
        constraint section_podfic_podfic_id_fk
            references public.podfic,
    part_id      integer
        constraint section_part_part_id_fk
            references public.part,
    number       integer,
    title        varchar(200),
    status       varchar(20),
    length       interval,
    raw_length   interval,
    plain_length interval,
    wordcount    integer,
    text_link    text,
    ao3_link     text,
    posted_date  date,
    html_string  text,
    deadline     timestamp with time zone,
    updated_at   timestamp with time zone
);

alter table public.section
    owner to "podfic-tracker-db_owner";

create table public.chapter_section
(
    chapter_id integer not null
        constraint chapter_section_chapter_chapter_id_fk
            references public.chapter,
    section_id integer not null
        constraint chapter_section_section_section_id_fk
            references public.section,
    constraint chapter_section_pk
        primary key (chapter_id, section_id)
);

alter table public.chapter_section
    owner to "podfic-tracker-db_owner";

create table public.file
(
    file_id    serial
        constraint file_pk
            primary key,
    podfic_id  integer
        constraint file_podfic_podfic_id_fk
            references public.podfic,
    length     interval not null,
    size       integer,
    filetype   varchar(20),
    label      text,
    is_plain   boolean,
    section_id integer
        constraint file_section_section_id_fk
            references public.section
);

alter table public.file
    owner to "podfic-tracker-db_owner";

alter sequence public.file_podfic_id_seq owned by public.file.podfic_id;

create unique index file_file_id_uindex
    on public.file (file_id);

create table public.file_link
(
    file_link_id serial
        constraint file_link_pk
            primary key,
    file_id      integer
        constraint file_link_file_file_id_fk
            references public.file,
    host         varchar(20),
    link         varchar(500) not null,
    is_direct    boolean,
    is_embed     boolean
);

alter table public.file_link
    owner to "podfic-tracker-db_owner";

create unique index file_link_file_link_id_uindex
    on public.file_link (file_link_id);

create table public.note
(
    note_id    serial
        constraint note_pk
            primary key,
    podfic_id  integer
        constraint note_podfic_podfic_id_fk
            references public.podfic,
    author_id  integer
        constraint note_author_author_id_fk
            references public.author,
    event_id   integer
        constraint note_event_event_id_fk
            references public.event,
    label      varchar(200),
    value      text,
    section_id integer
        constraint note_section_section_id_fk
            references public.section
);

alter table public.note
    owner to "podfic-tracker-db_owner";

alter sequence public.note_author_id_seq owned by public.note.author_id;

alter sequence public.note_event_id_seq owned by public.note.event_id;

alter sequence public.note_podfic_id_seq owned by public.note.podfic_id;

create unique index note_note_id_uindex
    on public.note (note_id);

create table public.recording_session
(
    recording_id serial
        constraint recording_session_pk
            primary key,
    podfic_id    integer
        constraint recording_session_podfic_podfic_id_fk
            references public.podfic,
    length       interval not null,
    date         date,
    mic          text,
    device       text,
    location     text,
    year         integer,
    month        integer,
    section_id   integer
        constraint recording_session_section_section_id_fk
            references public.section
);

alter table public.recording_session
    owner to "podfic-tracker-db_owner";

alter sequence public.recording_session_podfic_id_seq owned by public.recording_session.podfic_id;

create unique index recording_session_recording_id_uindex
    on public.recording_session (recording_id);

create table public.resource_section
(
    resource_id integer not null
        constraint resource_section_resource_resource_id_fk
            references public.resource,
    section_id  integer not null
        constraint resource_section_section_section_id_fk
            references public.section,
    podfic_id   integer not null
        constraint resource_section_podfic_podfic_id_fk
            references public.podfic,
    constraint resource_section_pk
        primary key (resource_id, section_id, podfic_id)
);

alter table public.resource_section
    owner to "podfic-tracker-db_owner";

create table public.tag_podfic
(
    tag_id    integer not null
        constraint tag_podfic_tag_tag_id_fk
            references public.tag,
    podfic_id integer not null
        constraint tag_podfic_podfic_podfic_id_fk
            references public.podfic,
    constraint tag_podfic_pk
        primary key (tag_id, podfic_id)
);

alter table public.tag_podfic
    owner to "podfic-tracker-db_owner";

create unique index work_work_id_uindex
    on public.work (work_id);

create table public.bingo_card
(
    bingo_card_id serial
        constraint bingo_card_pk
            primary key,
    title         text,
    event_id      integer
        constraint bingo_card_event_event_id_fk
            references public.event,
    size          integer not null,
    active        boolean,
    headers       text[],
    created_at    timestamp with time zone
);

alter table public.bingo_card
    owner to "podfic-tracker-db_owner";

create table public.bingo_square
(
    bingo_card_id integer not null
        constraint bingo_square_bingo_card_bingo_card_id_fk
            references public.bingo_card,
    row           integer not null,
    "column"      integer not null,
    title         text,
    description   text,
    filled        boolean,
    title_link    text,
    constraint bingo_square_pk
        primary key (bingo_card_id, row, "column"),
    constraint bingo_square_pk_2
        unique (bingo_card_id, row, "column")
);

alter table public.bingo_square
    owner to "podfic-tracker-db_owner";

create table public.bingo_fill
(
    bingo_fill_id serial
        constraint bingo_fill_pk
            primary key,
    bingo_card_id integer not null,
    row           integer not null,
    "column"      integer not null,
    title         text,
    description   text,
    podfic_id     integer
        constraint bingo_fill_podfic_podfic_id_fk
            references public.podfic,
    completed     boolean,
    constraint bingo_fill_bingo_square_bingo_card_id_row_column_fk
        foreign key (bingo_card_id, row, "column") references public.bingo_square
);

alter table public.bingo_fill
    owner to "podfic-tracker-db_owner";

create view public.podfic_work
            (podfic_id, work_id, title, nickname, status, length, event_id, link, ao3_link, type, posted_date,
             posted_year, is_multivoice, section_type, wordcount, chaptered, chapter_count)
as
SELECT podfic.podfic_id,
       podfic.work_id,
       work.title,
       work.nickname,
       podfic.status,
       podfic.length,
       podfic.event_id,
       work.link,
       podfic.ao3_link,
       podfic.type,
       podfic.posted_date,
       podfic.posted_year,
       podfic.is_multivoice,
       podfic.section_type,
       work.wordcount,
       work.chaptered,
       work.chapter_count
FROM podfic
         JOIN work ON podfic.work_id = work.work_id;

alter table public.podfic_work
    owner to "podfic-tracker-db_owner";

create function public.backfill_podfic_sections() returns void
    language plpgsql
as
$$
DECLARE
    record record;
BEGIN
    RAISE NOTICE 'backfilling podfic sections';

    FOR record in SELECT * FROM podfic INNER JOIN work ON podfic.work_id = work.work_id LOOP
        RAISE NOTICE 'running loop';
        IF record.section_type = 'default' THEN
            RAISE NOTICE 'creating default sections for podfic %', record.podfic_id;
            PERFORM create_default_podfic_sections(record.podfic_id, record.chaptered, record.is_multivoice);
        ELSEIF record.section_type = 'multiple-to-single' THEN
            RAISE NOTICE 'creating posted unchaptered sections for podfic %', record.podfic_id;
            PERFORM create_posted_unchaptered_podfic_sections(record.podfic_id);
        ELSE
            RAISE NOTICE 'non-applicable section type for podfic (%)', record.podfic_id;
        END IF;
        END LOOP;

    RETURN;
END;
$$;

alter function public.backfill_podfic_sections() owner to "podfic-tracker-db_owner";

create function public.create_default_podfic_sections(id integer, chaptered boolean, is_multivoice boolean) returns void
    language plpgsql
as
$$
DECLARE
    section_result int;
    record record;
    counter int;
BEGIN
    RAISE NOTICE 'creating default podfic sections for podfic (%)', id;

    section_result = (select section_id from section where section.podfic_id = id limit 1);
    RAISE NOTICE 'section result: (%)', section_result;

    counter := 0;

    IF section_result is not null THEN
        RAISE NOTICE 'there are sections present for the podfic, returning';
        RETURN;
    END IF;

    RAISE NOTICE 'creating default section(s)';

    IF is_multivoice THEN
        RAISE NOTICE 'inserting with parts';
        FOR record in SELECT * FROM part WHERE part.podfic_id = id ORDER BY created_at LOOP
            counter := counter + 1;
            INSERT INTO section (podfic_id, number, part_id, length, raw_length, wordcount, status, text_link, updated_at) VALUES (id, counter, record.part_id, record.length,record.raw_length,record.words, record.status,record.doc,NOW()) RETURNING section_id INTO section_result;
            PERFORM update_dependent_resources(id,null,record.part_id,section_result);
            END LOOP;
    ELSEIF chaptered THEN
        RAISE NOTICE 'inserting with chapters';
        FOR record in SELECT * FROM chapter WHERE chapter.podfic_id = id LOOP
            INSERT INTO section (podfic_id, number, length, raw_length, plain_length, wordcount, status, text_link, ao3_link, posted_date, html_string, updated_at) VALUES (id, record.chapter_number, record.length, record.raw_length, record.plain_length, record.wordcount, record.status, record.link, record.ao3_link, record.posted_date, record.html_string, NOW()) RETURNING section_id INTO section_result;
            INSERT INTO chapter_section (chapter_id, section_id) VALUES (record.chapter_id, section_result);
            PERFORM update_dependent_resources(id,record.chapter_id,null,section_result);
            END LOOP;
    ELSE
        RAISE NOTICE 'inserting without chapters';
        INSERT INTO section (podfic_id, length, raw_length, plain_length, wordcount, status, text_link, ao3_link, posted_date, html_string, deadline, number, updated_at) SELECT podfic_id, length, raw_length, plain_length, wordcount, status, link, ao3_link, posted_date, html_string, deadline, 1, NOW() FROM podfic INNER JOIN work on podfic.work_id = work.work_id WHERE podfic_id = id RETURNING section_id INTO section_result;
        PERFORM update_dependent_resources(id, null, null, section_result);
    END IF;

    RETURN;
END;
$$;

alter function public.create_default_podfic_sections(integer, boolean, boolean) owner to "podfic-tracker-db_owner";

create function public.create_part_schedule_event() returns trigger
    language plpgsql
as
$$
DECLARE
BEGIN
    IF new.deadline is not null AND old.deadline is null THEN
        RAISE NOTICE 'updating deadline (%) for part (%)', new.deadline, new.part_id;
        INSERT INTO schedule_event (podfic_id, chapter_id, part_id, start, "end", allday) VALUES (new.podfic_id, new.chapter_id, new.part_id, new.deadline, new.deadline, false);
    ELSE IF new.deadline is not null and old.deadline is not null and new.deadline != old.deadline THEN
        RAISE NOTICE 'creating new schedule event for part (%), updating old deadline (%) to new deadline (%)', new.part_id, old.deadline, new.deadline;
        DELETE FROM schedule_event where part_id = new.part_id;
        INSERT INTO schedule_event (podfic_id, chapter_id, part_id, start, "end", allday) VALUES (new.podfic_id, new.chapter_id, new.part_id, new.deadline, new.deadline, false);
    END IF;
    END IF;
    RETURN null;
END;
$$;

alter function public.create_part_schedule_event() owner to "podfic-tracker-db_owner";

create trigger on_insert_create_part_schedule_event
    after insert
    on public.part
    for each row
execute procedure public.create_part_schedule_event();

create trigger on_update_create_part_schedule_event
    after update
    on public.part
    for each row
execute procedure public.create_part_schedule_event();

create function public.create_posted_unchaptered_podfic_sections(id integer) returns void
    language plpgsql
as
$$
DECLARE
    section_result int;
    chapter_record record;
    podfic_record record;
BEGIN
    RAISE NOTICE 'creating posted unchaptered podfic sections for podfic (%)', id;

    section_result = (select section_id from section where section.podfic_id = id limit 1);
    RAISE NOTICE 'section result: (%)', section_result;

    IF section_result is not null THEN
        RAISE NOTICE 'there are sections present for the podfic, returning';
        RETURN;
    END IF;

    RAISE NOTICE 'creating posted unchaptered section(s)';

    FOR chapter_record in SELECT * FROM chapter where chapter.podfic_id = id LOOP
        INSERT INTO section (podfic_id, number, length, raw_length, plain_length, wordcount, status, text_link, ao3_link, posted_date, html_string, updated_at) VALUES (id, chapter_record.chapter_number * (-1), chapter_record.length, chapter_record.raw_length, chapter_record.plain_length, chapter_record.wordcount, chapter_record.status, chapter_record.link, chapter_record.ao3_link, chapter_record.posted_date, chapter_record.html_string,  NOW()) RETURNING section_id INTO section_result;
        INSERT INTO chapter_section (chapter_id, section_id) VALUES (chapter_record.chapter_id, section_result);
        PERFORM update_dependent_resources(id, chapter_record.chapter_id,null,section_result);
        END LOOP;

    SELECT * INTO podfic_record FROM podfic INNER JOIN work ON podfic.work_id = work.work_id WHERE podfic.podfic_id = id;
    INSERT INTO section (podfic_id, number, length, raw_length, plain_length, wordcount, status, text_link, ao3_link, posted_date, html_string,updated_at) VALUES (id, 1, podfic_record.length, podfic_record.raw_length, podfic_record.plain_length, podfic_record.wordcount, podfic_record.status, podfic_record.link, podfic_record.ao3_link, podfic_record.posted_date, podfic_record.html_string, NOW());

    RETURN;
END;
$$;

alter function public.create_posted_unchaptered_podfic_sections(integer) owner to "podfic-tracker-db_owner";

create function public.create_round_schedule_event() returns trigger
    language plpgsql
as
$$
DECLARE
BEGIN
    IF new.deadline is not null AND old.deadline is null THEN
        RAISE NOTICE 'updating deadline (%) for round (%)', new.deadline, new.round_id;
        INSERT INTO schedule_event (round_id, start, "end", allday) VALUES (new.round_id, new.deadline, new.deadline, false) ON CONFLICT DO NOTHING;
    END IF;
    RETURN null;
END;
$$;

alter function public.create_round_schedule_event() owner to "podfic-tracker-db_owner";

create procedure public.update_all_raw_lengths_from_recording_sessions()
    language plpgsql
as
$$
BEGIN
    RAISE NOTICE 'updating all raw lengths';
    
    UPDATE section
    SET raw_length = sum_rec_lengths.sum_raw
    FROM (SELECT section.section_id, SUM(recording_session.length) AS sum_raw
          FROM section
            LEFT JOIN recording_session ON section.section_id = recording_session.section_id
          GROUP BY section.section_id) AS sum_rec_lengths
    WHERE section.section_id = sum_rec_lengths.section_id;
    
    RAISE NOTICE 'updated all sections from recording sessions';
END;
$$;

alter procedure public.update_all_raw_lengths_from_recording_sessions() owner to "podfic-tracker-db_owner";

create function public.update_dependent_resources(podficid integer, chapterid integer, partid integer, sectionid integer) returns void
    language plpgsql
as
$$
BEGIN
    RAISE NOTICE 'updating dependent resources for podfic (%), chapter (%), section (%)', podficid, chapterid, sectionid;

    IF partid is not null THEN
        UPDATE recording_session SET section_id = sectionid WHERE part_id = partid AND podfic_id = podficid;
    ELSEIF chapterid is not null THEN
        UPDATE recording_session SET section_id = sectionid WHERE chapter_id = chapterid AND podfic_id = podficid;
        INSERT INTO resource_section (resource_id, section_id, podfic_id) SELECT resource_id, sectionid, podficid FROM resource_chapter WHERE chapter_id = chapterid ON CONFLICT DO NOTHING;
        UPDATE file SET section_id = sectionid WHERE chapter_id = chapterid AND podfic_id = podficid;
        UPDATE note SET section_id = sectionid WHERE chapter_id = chapterid AND podfic_id = podficid;
    ELSE
        -- NOTE: this only works bc we don't have single-to-multiple podfics rn
        UPDATE recording_session SET section_id = sectionid WHERE podfic_id = podficid AND chapter_id is null;
        UPDATE file SET section_id = sectionid WHERE podfic_id = podficid AND chapter_id is null;
    END IF;

    INSERT INTO resource_section (resource_id, section_id, podfic_id) SELECT resource_id, sectionid, podficid FROM resource_podfic WHERE podfic_id = podficid ON CONFLICT DO NOTHING;
END;
$$;

alter function public.update_dependent_resources(integer, integer, integer, integer) owner to "podfic-tracker-db_owner";

create function public.update_plain_length_from_file() returns trigger
    language plpgsql
as
$$
BEGIN
    RAISE NOTICE 'updating plain length from file(%)(%)(%)', new.section_id, new.podfic_id, new.length;
    IF new.is_plain is not true THEN
        RETURN null;
    END IF;
    IF new.section_id is not null THEN
        RAISE NOTICE 'inserting into section';
        UPDATE section set plain_length = new.length WHERE section_id = new.section_id;
    END IF;
    RETURN null;
END;
$$;

alter function public.update_plain_length_from_file() owner to "podfic-tracker-db_owner";

create trigger insert_file_update_plain_length
    after insert
    on public.file
    for each row
execute procedure public.update_plain_length_from_file();

create trigger update_file_update_plain_length
    after update
    on public.file
    for each row
execute procedure public.update_plain_length_from_file();

create function public.update_podfic_length_from_sections() returns trigger
    language plpgsql
as
$$
DECLARE sum_length interval;
        sum_raw_length interval;
        sum_plain_length interval;
        sum_not_plain_length interval;
        sectiontype sectiontype;
        podfic_record record;
BEGIN
    RAISE NOTICE 'updating podfic length from its sections';
    -- TODO: there needs to be a way to distinguish summary sections/sections that don't count? bc of the whole negative numbers posted in one thing
    SELECT section_type INTO sectiontype from podfic WHERE podfic.podfic_id = new.podfic_id;

    -- if length has changed/it just got posted, meaning that the length should go into the podfic
    -- TODO: sections don't have statuses rn.
    IF (new.length != old.length or old.length is null or new.status = 'Posted' or new.status = 'Finished' or new.status = 'Posting') and new.number > 0 THEN
        RAISE NOTICE 'updating podfic length';
        SELECT * INTO podfic_record FROM podfic WHERE podfic.podfic_id = new.podfic_id;
        IF podfic_record.is_multivoice THEN
            IF podfic_record.self_posted AND new.part_id is null THEN
                RAISE NOTICE 'Self-posted multivoice posting section, updating length from this section alone';
                UPDATE podfic SET length = new.length WHERE podfic_id = new.podfic_id;
            END IF;

            IF podfic_record.self_posted = false AND new.part_id is not null THEN
                RAISE NOTICE 'updating multivoice length from your part';
                SELECT sum(length) INTO sum_length from section where podfic_id = new.podfic_id and section.part_id is not null;
                RAISE NOTICE 'sum_length: %', sum_length;
                UPDATE podfic SET length = sum_length WHERE podfic_id = new.podfic_id;
            END IF;
        ELSE
            SELECT SUM(length) into sum_length from section WHERE podfic_id = new.podfic_id and (section.status = 'Posted' or section.status = 'Finished' or section.status = 'Posting');
            RAISE NOTICE 'sum_length: %', sum_length;
            UPDATE podfic SET length = sum_length WHERE podfic_id = new.podfic_id;
        END IF;
    END IF;

    -- update raw length
    IF new.raw_length != old.raw_length or old.raw_length is null THEN
        RAISE NOTICE 'updating podfic raw length';
        SELECT SUM(raw_length) into sum_raw_length from section where podfic_id = new.podfic_id;
        RAISE NOTICE 'sum_raw_length: %', sum_raw_length;
        UPDATE podfic SET raw_length = sum_raw_length WHERE podfic_id = new.podfic_id;
    END IF;
    
    -- update plain length
    IF new.plain_length != old.plain_length or old.plain_length is null THEN
        RAISE NOTICE 'updating podfic plain length';
        SELECT SUM(plain_length) into sum_plain_length from section where podfic_id = new.podfic_id;
        RAISE NOTICE 'sum plain length: %', sum_plain_length;
        SELECT sum(length) into sum_not_plain_length from section where podfic_id = new.podfic_id and section.plain_length is null and length is not null;
        RAISE NOTICE 'sum not plain length: %', sum_not_plain_length;
        IF sum_not_plain_length is null THEN
            RAISE NOTICE 'null, setting to only plain length';
            UPDATE podfic SET plain_length = sum_plain_length WHERE podfic_id = new.podfic_id;
        ELSE
            UPDATE podfic SET plain_length = sum_plain_length + sum_not_plain_length WHERE podfic_id = new.podfic_id;
        END IF;
    END IF;

    RETURN null;
END;
$$;

alter function public.update_podfic_length_from_sections() owner to "podfic-tracker-db_owner";

create trigger update_podfic_length
    after update
    on public.section
    for each row
execute procedure public.update_podfic_length_from_sections();

create function public.update_raw_length_from_recording_session() returns trigger
    language plpgsql
as
$$
DECLARE orig_raw_length interval;
BEGIN
    RAISE NOTICE 'updating raw length from recording session(%)(%)(%)', new.podfic_id, new.section_id, new.length;

    IF new.section_id is not null THEN
        RAISE NOTICE 'inserting into section';
        orig_raw_length = (SELECT raw_length from section WHERE section_id = new.section_id);
        IF orig_raw_length is null THEN
            RAISE NOTICE 'raw length is null, setting fully';
            UPDATE section SET raw_length = new.length WHERE section_id = new.section_id;
        ELSE
            RAISE NOTICE 'raw length is not null, adding';
            UPDATE section SET raw_length = raw_length + new.length WHERE section_id = new.section_id;
        END IF;
    END IF;
    RETURN null;
END;
$$;

alter function public.update_raw_length_from_recording_session() owner to "podfic-tracker-db_owner";

create trigger update_raw_length
    after insert
    on public.recording_session
    for each row
execute procedure public.update_raw_length_from_recording_session();

create function public.update_recording_session_length() returns trigger
    language plpgsql
as
$$
DECLARE orig_raw_length interval;
        sum_raw_length interval;
BEGIN
    RAISE NOTICE 'updating recording session length from (%) to (%)', new.length, old.length;
    IF new.length != old.length then
        IF new.section_id is not null then
            RAISE NOTICE 'updating section';
            orig_raw_length = (SELECT raw_length from section where section.section_id = new.section_id);
            -- if update is coming from just this update
            IF orig_raw_length = old.length then
                UPDATE section SET raw_length = new.length WHERE section.section_id = new.section_id;
            ELSE
                sum_raw_length = (SELECT length from recording_session where recording_session.section_id = new.section_id and recording_session.recording_id != new.recording_id);
                IF sum_raw_length is not null then
                    UPDATE section SET raw_length = new.length + sum_raw_length WHERE section.section_id = new.section_id;
                ELSE
                    UPDATE section SET raw_length = new.length WHERE section.section_id = new.section_id;
                END IF;
            END IF;
        ELSIF new.podfic_id is not null then
            RAISE NOTICE 'updating podfic';
            orig_raw_length = (SELECT raw_length from podfic where podfic.podfic_id = new.podfic_id);
            IF orig_raw_length = old.length then
                UPDATE podfic SET raw_length = new.length WHERE podfic.podfic_id = new.podfic_id;
            ELSE
                sum_raw_length = (SELECT length from recording_session where recording_session.podfic_id = new.podfic_id and recording_session.recording_id != new.recording_id);
                IF sum_raw_length is not null then
                    UPDATE podfic SET raw_length = new.length + sum_raw_length WHERE podfic.podfic_id = new.podfic_id;
                ELSE
                    UPDATE podfic SET raw_length = new.length WHERE podfic.podfic_id = new.podfic_id;
                END IF;
            END IF;
        END IF;
    END IF;
    RETURN null;
END;
$$;

alter function public.update_recording_session_length() owner to "podfic-tracker-db_owner";

create trigger update_update_raw_length
    after update
    on public.recording_session
    for each row
execute procedure public.update_recording_session_length();

create function public.update_schedule_event_type() returns trigger
    language plpgsql
as
$$
DECLARE se_type scheduleeventtype;
begin
    IF new.type is null THEN
        IF new.round_id is not null THEN
            se_type = 'Round';
        ELSE IF new.part_id is not null THEN
            se_type = 'Part';
        ELSE IF new.chapter_id is not null THEN
            se_type = 'Chapter';
        ELSE IF new.podfic_id is not null THEN
            se_type = 'Podfic';
        END IF;
        END IF;
        END IF;
        END IF;
        RAISE NOTICE 'updating schedule event (%) with type (%)', new.schedule_event_id, se_type;
        UPDATE schedule_event SET type = se_type WHERE schedule_event_id = new.schedule_event_id;
    END IF;
    RETURN null;
end;
$$;

alter function public.update_schedule_event_type() owner to "podfic-tracker-db_owner";

create trigger update_schedule_event_type
    after insert
    on public.schedule_event
    for each row
execute procedure public.update_schedule_event_type();

create trigger update_update_schedule_event_type
    after update
    on public.schedule_event
    for each row
execute procedure public.update_schedule_event_type();

create function public.backfill_resource_section_podfic_id() returns void
    language plpgsql
as
$$
DECLARE
    record record;
BEGIN
    RAISE NOTICE 'backfilling podfic sections';

    FOR record in SELECT resource_section.resource_id,resource_section.section_id,section.podfic_id FROM resource_section INNER JOIN section ON resource_section.section_id = section.section_id LOOP
        UPDATE resource_section SET podfic_id = record.podfic_id WHERE resource_id = record.resource_id AND section_id = record.section_id;
        END LOOP;

    RETURN;
END;
$$;

alter function public.backfill_resource_section_podfic_id() owner to "podfic-tracker-db_owner";