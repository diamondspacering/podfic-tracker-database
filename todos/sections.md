# General

- How to handle posted year?
- [ ] Be consistent about providing only section id or both section and podfic id to pages (html, recording session)
  - podfic id makes things a little faster; maybe less clean, but can't hurt since we have access to it anyways
- [ ] Should there be a podfic id on resource_section? probably, should migrate that real quick
- [ ] Update values on section in podfic table and then podfic is updated from it?

# Creation general

- [ ] Figure out how best to handle section numbering
  - for chapters-split, may be best to number sections per chapter rather than on a global counter
  - check where section numbers are being set (in posting form? when creating?) and look at it
  - just make sure chapters-split is tracking number within chapter adequately - I think this would be best covered by per-chapter counts
- [ ] Should you be able to manually set posted dates when creating sections?
- [ ] Set section status when creating?

# Recording sessions

- [ ] Figure out some of the nastier/more confusing useeffects

# Chapter asstd

- [ ] vt_project_id should go on section
- [ ] vt_project_id should be usable per section
- [ ] Clean up Chapter type
- [ ] Figure out what you're doing with the adding chapter functionality of AddMenu

# Chapter table

- [ ] Support for single-to-multiple (just SectionOnlyTable?)

## Chapter table context

- [ ] Consider using columns in chapter table context? and managing some expansion?
- [ ] Column visibility?

## Chapter with sub sections

- [ ] Is there a way for the chapter row to be less...widely spaced. Maybe dummy columns at end to allow for width of children?

# HTML

- [ ] Support generating AA chapter links with sections
- [ ] General podfic notes as well as section-specific notes?

# Schedule Page

- [ ] Fix it to work with sections
- [ ] schedule_event should link to sections not chapters
- [ ] Update (& expand?) DB triggers

# Stats Page

- [ ] Fix it to work with sections
- [ ] Should posted_year be retired entirely?
- [ ] is_multivoice vs. type = 'multivoice'?
- [ ] median as well as mean?
- [ ] several posted sections with null length - this is problematic, investigate
- [ ] also do number of all podfics posted, not just solo ones
- [ ] add total raw wordcount
- [ ] Check numbers against previous stats to make sure you're not severely messing up
  - check out master below PR and link to previous server database

# Parts

- [ ] Support setting section status in part form? prob not needed
- [ ] [FUTURE] Support multiple sections per part
- [ ] [IMPT] Correctly handle default part to be able to set length & post + section parts
  - inline podfic updates should go onto default part without issue

# Podfic Form/Creation

- [ ] Directly handle section info in podfic form more

# Asstd

- [ ] Loading state for section in file dialog
- [ ] File link form needs chapter info for
