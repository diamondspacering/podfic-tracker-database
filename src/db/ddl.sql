create database "podfic-tracker-db"
    with owner "podfic-tracker-db_owner";

grant connect, create, temporary on database "podfic-tracker-db" to neon_superuser;

create sequence public.author_podficcer_id_seq
    as integer;

alter sequence public.author_podficcer_id_seq owner to "podfic-tracker-db_owner";

create sequence public.cover_art_podfic_id_
seq
    as integer;

alter sequence public.cover_art_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.cover_art_podficcer_id_seq
    as integer;

alter sequence public.cover_art_podficcer_id_seq owner to "podfic-tracker-db_owner";

create sequence public.file_chapter_id_seq
    as integer;

alter sequence public.file_chapter_id_seq owner to "podfic-tracker-db_owner";

create sequence public.file_podfic_id_seq
    as integer;

alter sequence public.file_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.note_author_id_seq
    as integer;

alter sequence public.note_author_id_seq owner to "podfic-tracker-db_owner";

create sequence public.note_chapter_id_seq
    as integer;

alter sequence public.note_chapter_id_seq owner to "podfic-tracker-db_owner";

create sequence public.note_event_id_seq
    as integer;

alter sequence public.note_event_id_seq owner to "podfic-tracker-db_owner";

create sequence public.note_podfic_id_seq
    as integer;

alter sequence public.note_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.podfic_event_id_seq
    as integer;

alter sequence public.podfic_event_id_seq owner to "podfic-tracker-db_owner";

create sequence public.podfic_giftee_id_seq
    as integer;

alter sequence public.podfic_giftee_id_seq owner to "podfic-tracker-db_owner";

create sequence public.podfic_work_id_seq
    as integer;

alter sequence public.podfic_work_id_seq owner to "podfic-tracker-db_owner";

create sequence public.recording_session_chapter_id_seq
    as integer;

alter sequence public.recording_session_chapter_id_seq owner to "podfic-tracker-db_owner";

create sequence public.recording_session_podfic_id_seq
    as integer;

alter sequence public.recording_session_podfic_id_seq owner to "podfic-tracker-db_owner";

create sequence public.schedule_event_chapter_id_seq
    as integer;

alter sequence public.schedule_event_chapter_id_seq owner to "podfic-tracker-db_owner";

create sequence public.work_author_id_seq
    as integer;

alter sequence public.work_author_id_seq owner to "podfic-tracker-db_owner";

create sequence public.work_fandom_id_seq
    as integer;

alter sequence public.work_fandom_id_seq owner to "podfic-tracker-db_owner";

create sequence public.part_chapter_id_seq
    as integer;

alter sequence public.part_chapter_id_seq owner to "podfic-tracker-db_owner";

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
    parent_id serial
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
    category_id serial
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
    podficcer_id         integer default nextval('author_podficcer_id_seq'::regclass)
        constraint author_podficcer_podficcer_id_fk
            references public.podficcer,
    asked_date           date
);

alter table public.author
    owner to "podfic-tracker-db_owner";

alter sequence public.author_podficcer_id_seq owned by public.author.podficcer_id;

create unique index author_author_id_uindex
    on public.author (author_id);

create unique index podficcer_podficcer_id_uindex
    on public.podficcer (podficcer_id);

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
    author_id   serial
        constraint resource_author_author_author_id_fk
            references public.author,
    constraint resource_author_pk
        primary key (resource_id, author_id)
);

alter table public.resource_author
    owner to "podfic-tracker-db_owner";

create table public.resource_test
(
);

alter table public.resource_test
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

create table public.test
(
);

alter table public.test
    owner to "podfic-tracker-db_owner";

create table public.voiceteam_event
(
    voiceteam_event_id serial
        constraint voiceteam_event_pk
            primary key,
    event_id           serial
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

create table public.round
(
    round_id           serial
        constraint round_pk
            primary key,
    voiceteam_event_id serial
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
    challenge_id serial
        constraint challenge_pk
            primary key,
    round_id     serial
        constraint challenge_round_round_id_fk
            references public.round,
    name         text,
    description  text,
    points       integer,
    bonus_points integer,
    created_at   timestamp with time zone
);

alter table public.challenge
    owner to "podfic-tracker-db_owner";

create table public.vt_project
(
    vt_project_id      serial
        constraint vt_project_pk
            primary key,
    challenge_id       serial
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
    author_id      integer default nextval('work_author_id_seq'::regclass)
        constraint work_author_author_id_fk
            references public.author,
    fandom_id      integer default nextval('work_fandom_id_seq'::regclass)
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

alter sequence public.work_author_id_seq owned by public.work.author_id;

alter sequence public.work_fandom_id_seq owned by public.work.fandom_id;

create table public.podfic
(
    podfic_id          serial
        constraint podfic_pk
            primary key,
    work_id            integer default nextval('podfic_work_id_seq'::regclass)
        constraint podfic_work_work_id_fk
            references public.work,
    status             varchar(20) not null,
    is_private         boolean,
    length             interval,
    raw_length         interval,
    event_id           integer default nextval('podfic_event_id_seq'::regclass)
        constraint podfic_event_event_id_fk
            references public.event,
    ao3_link           varchar(200),
    posted_date        date,
    exclude_stats      boolean,
    type               varchar(20),
    giftee_id          integer default nextval('podfic_giftee_id_seq'::regclass)
        constraint podfic_podficcer_podficcer_id_fk
            references public.podficcer,
    deadline           timestamp with time zone,
    added_date         timestamp with time zone,
    posted_year        integer,
    plain_length       interval,
    html_string        text,
    updated_at         timestamp with time zone,
    series_id          integer
        constraint podfic_series_series_id_fk
            references public.series,
    vt_project_id      integer
        constraint podfic_vt_project_vt_project_id_fk
            references public.vt_project,
    posted_unchaptered boolean
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
    podfic_id      serial
        constraint chapter_podfic_podfic_id_fk
            references public.podfic,
    link           varchar(200),
    chapter_number integer,
    chapter_title  varchar(200),
    wordcount      integer,
    length         interval,
    raw_length     interval,
    status         varchar(20),
    ao3_link       varchar(200),
    posted_date    date,
    deadline       timestamp with time zone,
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
    podfic_id         integer default nextval('cover_art_podfic_id_seq'::regclass)
        constraint cover_art_podfic_podfic_id_fk
            references public.podfic,
    cover_artist_name varchar(20),
    podficcer_id      integer default nextval('cover_art_podficcer_id_seq'::regclass)
        constraint cover_art_podficcer_podficcer_id_fk
            references public.podficcer,
    image_link        varchar(200),
    status            varchar(20)
);

alter table public.cover_art
    owner to "podfic-tracker-db_owner";

alter sequence public.cover_art_podfic_id_seq owned by public.cover_art.podfic_id;

alter sequence public.cover_art_podficcer_id_seq owned by public.cover_art.podficcer_id;

create unique index cover_art_cover_art_id_uindex
    on public.cover_art (cover_art_id);

create table public.file
(
    file_id    serial
        constraint file_pk
            primary key,
    podfic_id  integer default nextval('file_podfic_id_seq'::regclass)
        constraint file_podfic_podfic_id_fk
            references public.podfic,
    chapter_id integer default nextval('file_chapter_id_seq'::regclass)
        constraint file_chapter_chapter_id_fk
            references public.chapter,
    length     interval not null,
    size       integer,
    filetype   varchar(20),
    label      text,
    is_plain   boolean
);

alter table public.file
    owner to "podfic-tracker-db_owner";

alter sequence public.file_chapter_id_seq owned by public.file.chapter_id;

alter sequence public.file_podfic_id_seq owned by public.file.podfic_id;

create unique index file_file_id_uindex
    on public.file (file_id);

create table public.file_link
(
    file_link_id serial
        constraint file_link_pk
            primary key,
    file_id      serial
        constraint file_link_file_file_id_fk
            references public.file,
    host         varchar(20),
    link         varchar(200) not null,
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
    podfic_id  integer default nextval('note_podfic_id_seq'::regclass)
        constraint note_podfic_podfic_id_fk
            references public.podfic,
    chapter_id integer default nextval('note_chapter_id_seq'::regclass)
        constraint note_chapter_chapter_id_fk
            references public.chapter,
    author_id  integer default nextval('note_author_id_seq'::regclass)
        constraint note_author_author_id_fk
            references public.author,
    event_id   integer default nextval('note_event_id_seq'::regclass)
        constraint note_event_event_id_fk
            references public.event,
    label      varchar(200),
    value      text
);

alter table public.note
    owner to "podfic-tracker-db_owner";

alter sequence public.note_author_id_seq owned by public.note.author_id;

alter sequence public.note_chapter_id_seq owned by public.note.chapter_id;

alter sequence public.note_event_id_seq owned by public.note.event_id;

alter sequence public.note_podfic_id_seq owned by public.note.podfic_id;

create unique index note_note_id_uindex
    on public.note (note_id);

create table public.part
(
    part_id    serial
        constraint part_pk
            primary key,
    podfic_id  serial
        constraint part_podfic_podfic_id_fk
            references public.podfic,
    doc        text,
    organizer  serial
        constraint part_podficcer_podficcer_id_fk
            references public.podficcer,
    words      integer,
    type       text,
    status     varchar(20),
    length     interval,
    raw_length interval,
    part       text,
    chapter_id integer default nextval('part_chapter_id_seq'::regclass)
        constraint part_chapter_chapter_id_fk
            references public.chapter,
    deadline   timestamp with time zone,
    created_at timestamp with time zone,
    audio_link text
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
    podficcer_id serial
        constraint podfic_podficcer_podficcer_podficcer_id_fk
            references public.podficcer,
    constraint podfic_podficcer_id
        primary key (podfic_id, podficcer_id)
);

alter table public.podfic_podficcer
    owner to "podfic-tracker-db_owner";

create table public.recording_session
(
    recording_id serial
        constraint recording_session_pk
            primary key,
    podfic_id    integer default nextval('recording_session_podfic_id_seq'::regclass)
        constraint recording_session_podfic_podfic_id_fk
            references public.podfic,
    chapter_id   integer default nextval('recording_session_chapter_id_seq'::regclass)
        constraint recording_session_chapter_chapter_id_fk
            references public.chapter,
    length       interval not null,
    date         date,
    mic          text,
    device       text,
    location     text,
    year         integer,
    month        integer,
    part_id      integer
        constraint recording_session_part_part_id_fk
            references public.part
);

alter table public.recording_session
    owner to "podfic-tracker-db_owner";

alter sequence public.recording_session_chapter_id_seq owned by public.recording_session.chapter_id;

alter sequence public.recording_session_podfic_id_seq owned by public.recording_session.podfic_id;

create unique index recording_session_recording_id_uindex
    on public.recording_session (recording_id);

create table public.resource_chapter
(
    resource_id serial
        constraint resource_chapter_resource_resource_id_fk
            references public.resource,
    chapter_id  serial
        constraint resource_chapter_chapter_chapter_id_fk
            references public.chapter,
    podfic_id   serial
        constraint resource_chapter_podfic_podfic_id_fk
            references public.podfic,
    constraint resource_chapter_pk
        primary key (resource_id, chapter_id, podfic_id)
);

alter table public.resource_chapter
    owner to "podfic-tracker-db_owner";

create table public.resource_podfic
(
    resource_id serial
        constraint resource_podfic_resource_resource_id_fk
            references public.resource,
    podfic_id   serial
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
    podfic_id         serial
        constraint schedule_event_podfic_podfic_id_fk
            references public.podfic,
    chapter_id        integer default nextval('schedule_event_chapter_id_seq'::regclass)
        constraint schedule_event_chapter_chapter_id_fk
            references public.chapter,
    title             text,
    start             timestamp with time zone,
    "end"             timestamp with time zone,
    allday            boolean not null
);

alter table public.schedule_event
    owner to "podfic-tracker-db_owner";

alter sequence public.schedule_event_chapter_id_seq owned by public.schedule_event.chapter_id;

create unique index work_work_id_uindex
    on public.work (work_id);

create function public.update_plain_length_from_file() returns trigger
    language plpgsql
as
$$
DECLARE orig_raw_length interval;
BEGIN
    RAISE NOTICE 'updating plain length from file(%)(%)(%)', new.chapter_id, new.podfic_id, new.length;
    IF new.is_plain is not true THEN
        RETURN null;
    END IF;
    IF new.chapter_id is not null THEN
        RAISE NOTICE 'inserting into chapter';
        UPDATE chapter SET plain_length = new.length WHERE chapter_id = new.chapter_id;
    ELSIF new.podfic_id is not null THEN
        RAISE NOTICE 'inserting into podfic';
        UPDATE podfic SET plain_length = new.length WHERE podfic_id = new.podfic_id;
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

create function public.update_podfic_length_from_chapters() returns trigger
    language plpgsql
as
$$
DECLARE sum_length interval;
    sum_raw_length interval;
    sum_plain_length interval;
    sum_not_plain_length interval;
BEGIN
    RAISE NOTICE 'updating podfic length from its chapters';
    IF new.length != old.length or old.length is null THEN
        RAISE NOTICE 'updating podfic length';
        sum_length = (SELECT SUM(length) from chapter where podfic_id = new.podfic_id and chapter.status = 'Posted');
        RAISE NOTICE 'sum_length:(%)', sum_length;
        UPDATE podfic SET length = sum_length WHERE podfic_id = new.podfic_id;
    END IF;
    IF new.raw_length != old.raw_length or old.raw_length is null THEN
        RAISE NOTICE 'updating podfic raw length';
        SELECT SUM(raw_length) into sum_raw_length from chapter where podfic_id = new.podfic_id;
        RAISE NOTICE 'sum raw length:(%)', sum_raw_length;
        UPDATE podfic SET raw_length = sum_raw_length WHERE podfic_id = new.podfic_id;
    END IF;
    IF new.plain_length != old.plain_length or old.plain_length is null THEN
        RAISE NOTICE 'updating podfic plain length';
        SELECT SUM(plain_length) into sum_plain_length from chapter where podfic_id = new.podfic_id;
        RAISE NOTICE 'sum plain length:(%)', sum_plain_length;
        SELECT SUM(length) into sum_not_plain_length from chapter where podfic_id = new.podfic_id and chapter.plain_length is null;
        RAISE NOTICE 'sum not plain length:(%s)', sum_not_plain_length;
        UPDATE podfic SET plain_length = sum_plain_length + sum_not_plain_length WHERE podfic_id = new.podfic_id;
    END IF;
    RETURN new;
END;
$$;

alter function public.update_podfic_length_from_chapters() owner to "podfic-tracker-db_owner";

create trigger update_podfic_length
    after update
    on public.chapter
    for each row
execute procedure public.update_podfic_length_from_chapters();

create function public.update_raw_length_from_recording_session() returns trigger
    language plpgsql
as
$$
DECLARE orig_raw_length interval;
BEGIN
    RAISE NOTICE 'updating raw length from recording session(%)(%)(%)(%)', new.chapter_id, new.podfic_id, new.part_id, new.length;
    IF new.part_id is not null THEN
        RAISE NOTICE 'inserting into part';
        orig_raw_length = (SELECT raw_length FROM part WHERE part_id = new.part_id);
        IF orig_raw_length is null THEN
            RAISE NOTICE 'raw length is null, setting fully';
            UPDATE part SET raw_length = new.length WHERE part_id = new.part_id;
        ELSE
            RAISE NOTICE 'raw length is not null, adding';
            UPDATE part SET raw_length = raw_length + new.length WHERE part_id = new.part_id;
        END IF;
    END IF;

    IF new.chapter_id is not null THEN
        RAISE NOTICE 'inserting into chapter';
        orig_raw_length = (SELECT raw_length FROM chapter WHERE chapter_id = new.chapter_id);
        IF orig_raw_length is null THEN
            RAISE NOTICE 'raw length is null, setting fully';
            UPDATE chapter SET raw_length = new.length WHERE chapter_id = new.chapter_id;
        ELSE
            RAISE NOTICE 'raw length is not null, adding';
            UPDATE CHAPTER SET raw_length = raw_length + new.length WHERE chapter_id = new.chapter_id;
        END IF;
    ELSIF new.podfic_id is not null THEN
        RAISE NOTICE 'inserting into podfic';
        orig_raw_length = (SELECT raw_length FROM podfic WHERE podfic_id = new.podfic_id);
        IF orig_raw_length is null THEN
            RAISE NOTICE 'raw length is null, setting fully';
            UPDATE podfic SET raw_length = new.length WHERE podfic_id = new.podfic_id;
        ELSE
            RAISE NOTICE 'raw length is not null, adding';
            UPDATE podfic SET raw_length = raw_length + new.length WHERE podfic_id = new.podfic_id;
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
        IF new.chapter_id is not null then
            RAISE NOTICE 'updating chapter';
            orig_raw_length = (SELECT raw_length from chapter where chapter.chapter_id = new.chapter_id);
            IF orig_raw_length = old.length then
                UPDATE chapter SET raw_length = new.length WHERE chapter.chapter_id = new.chapter_id;
            ELSE
                sum_raw_length = (SELECT length from recording_session where recording_session.chapter_id = new.chapter_id and recording_session.recording_id != new.recording_id);
                IF sum_raw_length is not null then
                    UPDATE chapter SET raw_length = new.length + sum_raw_length WHERE chapter.chapter_id = new.chapter_id;
                ELSE
                    UPDATE chapter SET raw_length = new.length WHERE chapter.chapter_id = new.chapter_id;
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

create function public.update_length_from_parts() returns trigger
    language plpgsql
as
$$
DECLARE sum_length interval;
BEGIN
    RAISE NOTICE 'updating length from its parts';
    IF new.length != old.length or old.length is null THEN
        RAISE NOTICE 'updating length';
        IF new.chapter_id is not null THEN
            sum_length = (SELECT SUM(length) from part where part.chapter_id = new.chapter_id);
            UPDATE chapter SET length = sum_length WHERE chapter_id = new.chapter_id;
        ELSIF new.podfic_id is not null THEN
            sum_length = (SELECT SUM(length) from part where part.podfic_id = new.podfic_id);
            UPDATE podfic SET length = sum_length WHERE podfic_id = new.podfic_id;
        END IF;
    END IF;
    RETURN new;
END;
$$;

alter function public.update_length_from_parts() owner to "podfic-tracker-db_owner";

create trigger update_length
    after update
    on public.part
    for each row
execute procedure public.update_length_from_parts();


