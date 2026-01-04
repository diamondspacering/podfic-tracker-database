drop table account;

drop table chapter_section;

drop table cover_art;

drop table file_link;

drop table file;

drop table note;

drop table permission;

drop table podfic_podficcer;

drop table recording_session;

drop table resource_author;

drop table resource_event;

drop table resource_podfic;

drop table resource_section;

drop table resource_voiceteam_event;

drop table resource;

drop table schedule_event;

drop table section;

drop table part;

drop table chapter;

drop table session;

drop table tag_podfic;

drop table podfic;

drop table series;

drop table tag;

drop table "user";

drop table verification;

drop table vt_project;

drop table challenge;

drop table round;

drop table voiceteam_event;

drop table event;

drop table event_parent;

drop table work;

drop table author;

drop table fandom;

drop table fandom_category;

drop table podficcer;



drop function backfill_podfic_sections();

drop function create_default_podfic_sections(integer, boolean, boolean);

drop function create_part_schedule_event();

drop function create_posted_unchaptered_podfic_sections(integer);

drop function create_round_schedule_event();

drop procedure update_all_raw_lengths_from_recording_sessions();

drop function update_dependent_resources(integer, integer, integer, integer);

drop function update_plain_length_from_file();

drop function update_podfic_length_from_sections();

drop function update_raw_length_from_recording_session();

drop function update_recording_session_length();

drop function update_schedule_event_type();

drop function backfill_resource_section_podfic_id();



drop type scheduleeventtype;

drop type sectiontype;
