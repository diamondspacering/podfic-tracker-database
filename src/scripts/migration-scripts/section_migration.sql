-- TODO: start transaction

-- create and alter tables
create table section
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

create table chapter_section
(
    chapter_id integer not null
        constraint chapter_section_chapter_chapter_id_fk
            references chapter,
    section_id integer not null
        constraint chapter_section_section_section_id_fk
            references section,
    constraint chapter_section_pk
        primary key (chapter_id, section_id)
);

create table resource_section
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

create type public.sectiontype as enum ('default', 'single-to-multiple', 'multiple-to-single', 'chapters-split', 'chapters-combine');

alter type public.sectiontype owner to "podfic-tracker-db_owner";

alter table podfic
    add section_type sectiontype default 'default' not null;

-- create view podfic_work as
-- SELECT podfic.podfic_id,
--        podfic.work_id,
--        work.title,
--        work.nickname,
--        podfic.status,
--        podfic.length,
--        podfic.event_id,
--        work.link,
--        podfic.ao3_link,
--        podfic.type,
--        podfic.posted_unchaptered,
--        podfic.deadline,
--        podfic.updated_at,
--        podfic.is_multivoice,
--        podfic.section_type,
--        work.wordcount,
--        work.chaptered,
--        work.chapter_count
-- FROM podfic
--          JOIN work ON podfic.work_id = work.work_id;

UPDATE podfic SET section_type = 'multiple-to-single' WHERE podfic.posted_unchaptered = true and podfic.section_type = 'default';

alter table recording_session
    add section_id integer
        constraint recording_session_section_section_id_fk
            references section;

alter table file
    add section_id integer
        constraint file_section_section_id_fk
            references section;

alter table note
    add section_id integer
        constraint note_section_section_id_fk
            references section;

-- create and update functions
CREATE OR REPLACE PROCEDURE update_all_raw_lengths_from_recording_sessions()
    LANGUAGE plpgsql
AS
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

ALTER PROCEDURE update_all_raw_lengths_from_recording_sessions() OWNER TO "podfic-tracker-db_owner";

CREATE OR REPLACE FUNCTION update_plain_length_from_file() RETURNS trigger
    LANGUAGE plpgsql
AS
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

ALTER FUNCTION update_plain_length_from_file() OWNER TO "podfic-tracker-db_owner";

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

CREATE OR REPLACE FUNCTION update_raw_length_from_recording_session() RETURNS trigger
    LANGUAGE plpgsql
AS
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

ALTER FUNCTION update_raw_length_from_recording_session() OWNER TO "podfic-tracker-db_owner";

create trigger update_raw_length
    after insert
    on public.recording_session
    for each row
execute procedure public.update_raw_length_from_recording_session();

CREATE OR REPLACE FUNCTION update_recording_session_length() RETURNS trigger
    LANGUAGE plpgsql
AS
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

ALTER FUNCTION update_recording_session_length() OWNER TO "podfic-tracker-db_owner";

create trigger update_update_raw_length
    after update
    on public.recording_session
    for each row
execute procedure public.update_recording_session_length();

CREATE FUNCTION update_podfic_length_from_sections() RETURNS trigger
    LANGUAGE plpgsql
AS
$$
DECLARE sum_length interval;
        sum_raw_length interval;
        sum_plain_length interval;
        sum_not_plain_length interval;
        sectiontype sectiontype;
BEGIN
    RAISE NOTICE 'updating podfic length from its sections';
    -- TODO: there needs to be a way to distinguish summary sections/sections that don't count? bc of the whole negative numbers posted in one thing
    SELECT section_type INTO sectiontype from podfic WHERE podfic.podfic_id = new.podfic_id;

    IF new.number < 0 THEN
        RETURN null;
    END IF;

    -- if length has changed/it just got posted, meaning that the length should go into the podfic
    IF new.length != old.length or old.length is null or (new.status != old.status and new.status = 'Posted') THEN
        RAISE NOTICE 'updating podfic length';
        SELECT SUM(length) into sum_length from section WHERE podfic_id = new.podfic_id and section.status = 'Posted';
        RAISE NOTICE 'sum_length: %', sum_length;
        UPDATE podfic SET length = sum_length WHERE podfic_id = new.podfic_id;
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
        SELECT sum(length) into sum_not_plain_length from section where podfic_id = new.podfic_id and section.plain_length is null;
        RAISE NOTICE 'sum not plain length: %', sum_not_plain_length;
        UPDATE podfic SET plain_length = sum_plain_length + sum_not_plain_length WHERE podfic_id = new.podfic_id;
    END IF;

    RETURN null;
END;
$$;

ALTER FUNCTION update_podfic_length_from_sections() OWNER TO "podfic-tracker-db_owner";

create trigger update_podfic_length
    after update
    on public.section
    for each row
execute procedure public.update_podfic_length_from_sections();

CREATE FUNCTION update_dependent_resources(podficid integer, chapterid integer, partid integer, sectionid integer) RETURNS void
    language plpgsql
AS
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

CREATE FUNCTION create_default_podfic_sections(id integer, chaptered boolean, is_multivoice boolean) RETURNS void
    LANGUAGE plpgsql
AS
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

ALTER FUNCTION create_default_podfic_sections(integer, boolean, boolean) OWNER TO "podfic-tracker-db_owner";

CREATE FUNCTION create_posted_unchaptered_podfic_sections(id integer) RETURNS void
    LANGUAGE plpgsql
AS
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

ALTER FUNCTION create_posted_unchaptered_podfic_sections(integer) OWNER TO "podfic-tracker-db_owner";

CREATE TRIGGER update_podfic_length
    AFTER UPDATE
    ON section
    FOR EACH ROW
EXECUTE PROCEDURE update_podfic_length_from_sections();

CREATE FUNCTION backfill_podfic_sections() RETURNS void
    LANGUAGE plpgsql
AS
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

ALTER FUNCTION backfill_podfic_sections() OWNER TO "podfic-tracker-db_owner";

-- backfill section data & connections
SELECT backfill_podfic_sections();

-- clean up old things
drop trigger update_length on part;

drop trigger update_podfic_length on chapter;

drop function update_podfic_length_from_chapters();

drop function update_length_from_parts();

alter table recording_session
    drop column chapter_id;

alter table recording_session
    drop column part_id;

-- drop view podfic_work;

-- alter table podfic
--     drop column posted_date;

-- alter table podfic
--     drop column posted_year;

alter table podfic
    drop column html_string;

alter table podfic
    drop column posted_unchaptered;

alter table chapter
    drop column length;

alter table chapter
    drop column raw_length;

alter table chapter
    drop column ao3_link;

alter table chapter
    drop column posted_date;

alter table chapter
    drop column deadline;

alter table chapter
    drop column status;

alter table part
    drop column doc;

alter table part
    drop column words;

alter table part
    drop column length;

alter table part
    drop column raw_length;

alter table file
    drop column chapter_id;

alter table note
    drop column chapter_id;

drop table resource_chapter;

-- TODO: end transaction