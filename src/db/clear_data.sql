drop table cover_art;

drop table file_link;

drop table file;

drop table note;

drop table podfic_podficcer;

drop table recording_session;

drop table resource_author;

drop table resource_chapter;

drop table resource_event;

drop table resource_podfic;

drop table resource_voiceteam_event;

drop table resource;

drop table schedule_event;

drop table part;

drop table chapter;

drop table tag_podfic;

drop table podfic;

drop table series;

drop table tag;

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

drop table session;

drop table account;

drop table "user";

drop table verification;



drop function create_part_schedule_event();

drop function create_round_schedule_event();

drop procedure update_all_raw_lengths_from_recording_sessions();

drop function update_length_from_parts();

drop function update_plain_length_from_file();

drop function update_podfic_length_from_chapters();

drop function update_raw_length_from_recording_session();

drop function update_recording_session_length();

drop function update_schedule_event_type();


drop sequence author_podficcer_id_seq;

drop sequence work_author_id_seq;

drop sequence work_fandom_id_seq;


drop type scheduleeventtype;
