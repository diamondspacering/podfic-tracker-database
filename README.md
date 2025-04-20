# Podfic Tracker Database

Database & web app for podfic tracking, focusing on project progress tracking, statistics, and HTML generation for AO3 posts.

Note: This is very much a work in progress and some things may work strangely or not at all. There is an assumption of some technical knowledge/ability to figure things out - you will at least need to be able to create and manage a PostgreSQL database and run a Node project.

## Setup

### Database

Create a PostgreSQL database called "podfic-tracker-db" with an owner called
"podfic-tracker-db_owner". Use the DDL in `src/db` to set up the tables & relationships & routines.

I like to use DataGrip or DBeaver to help manage manual database things. DataGrip is a paid tool, though it has a good free trial, and DBeaver has both free and paid options but the free option has been sufficient for everything I've needed for this project.

#### Environment variables

Create a file in the project root directory named `.env` and put the connection string in it. Currently the project is set up to be able to switch between two databases (one being designated as local). It is not necessary to have two databases set up; both strings can be the same, or you can only define one and make sure that `USE_LOCAL` points to it. (Or just change the references so it only refers to one connection string). The relevant variables are:

- `CONNECTION_STRING` for non-local database connection string
- `CONNECTION_STRING_LOCAL` for local database connection string
- `USE_LOCAL` to designate which database should be used; set to '0' for non-local database, '1' for local database.

If you want to be able to log in to AO3 to get metadata for user-locked works, put your username in the `AO3_USERNAME` variable and your password in the `AO3_PWD` variable.

#### Manual Setup

Some stuff will need to be manually set up:

- Create a podficcer in the `podficcer` table for yourself. Some things assume a podficcer with the id of `1` already exists, and this is treated as you/the default podficcer, so this is why.
- It is possible some pages will crash if there's nothing in the database, you may need to manually create some podfics, etc.
- For Voiceteams, you need to manually create a `voiceteam_event` for each `event` that is a Voiceteam that you want to do voiceteam-specific things for. If you don't, when you try to click into that Voiceteam the app will rerender infinitely and probably crash. Yes this is bad no I don't currently have plans to fix it. TODO: add a dummy Voiceteam event to base yours off of?

### App

Have node and npm installed. In the project root directory, run `npm install`. Run `npm run dev` to run the project. Probably possible to build? Haven't done that yet. Project is at `http://localhost:3001`.

## Usage

TODO: separate md file for this? wiki?

App performance is kinda suboptimal right now, it's a work in progress. Data will almost certainly load faster if you are using a local database. Pages will take a little while to render when you first go to them after running the app, but should load more quickly thereafter. Some changes to data can take a little while to show up, and loading state is not always clear on new pages; be patient.

TODO: mention the update metadata script & env variables & json file for it

### UI

Most things should be self-explanatory. [add various clarifying things]

## Work Metadata

Currently there is not functionality to automatically pull metadata from AO3 while filling out forms. (There are also multiple metadata fields missing from the form that are defined in the database and used for stats.) However, there is a script that can be manually run to fill in this data (so you don't have to specify things like wordcount, author, fandom, rating, chapter data, etc.).

To run the script:

- Check "Pull metadata from AO3" checkbox when creating a new work/podfic
- Make sure you have Python 3.x installed. Know whether it's run with `python` or `python3`. (On Windows, it should be `python`, on Linux it will probably be `python3`.) Install the required packages for the script with `pip install -r requirements.txt`.
- The script will automatically try to log in to AO3 so it is able to view restricted works. To do this, it needs your username and password, which you can set as explained in the [environment variables section](#environment-variables). This can be a little slow, it's fine.
  - The way the login works has been known to break sometimes; if it's not working, try again or try later, remove the login if it's not needed, and feel free to open an issue on GitHub if the problem persists. TODO: alternative method w/ reading from downloaded file
  - If you don't want to log in for whatever reason, you can remove the part of the script that logs in. Find the line in `src/scripts/update_metadata.py` that reads `login()` (currently line 273; this may not be up to date) (NOT the line that reads `def login():`) and add `#` to the front of it. Remove the `#` if you want to restore login functionalities.
- Run the update metadata script - `npm run update-metadata` for `python`, `npm run update-metadata-3` for `python3`.
  - Make sure to run the script from the root folder, may not work otherwise
- This script will run through all of the works in the database that need their metadata updated and fetch the data from AO3. There are a few prompts as it runs, which should be relatively self-explanatory but are explained here:
  - It will ask for a fandom category if there is not one provided, and either link it to an existing category if you enter the name exactly or create a new one. Use these fandom categories however you like, the intent and my personal usage is to indicate the genre or media type of the fandom (e.g., books, cdramas, anime/manga, etc.)
  - It will ask for confirmations/corrections on main characters and main ships. Enter "Gen" if there is no main ship or platonic relationship you want to record.
  - When asking to "map" relationships/fandoms/characters, this is asking if you want to provide a different name to be displayed and used for these AO3 tags - often useful for very long tag names or if you want to use a smushname for a ship. The original tag will not be displayed anywhere in the application, only what you enter for the mapped name.
  - Mapped tags will be printed out at the end after the script has finished updating all metadata. If you wish to keep using these mappings automatically, paste them into the correct locations in `tag_mappings.json`, and the script will use them automatically and not prompt you again. TODO: make this automatically update the file
  - If the fic has chapters, it will ask if you want to fetch the chapters; this will fetch all chapters and chapter names, along with word counts.
- When the script has finished running, all the fics for which you checked that box will have updated metadata. If you need to update metadata again, edit the podfic and check the box again before running hte script so they will be marked as needing it.
  - If the script crashes, all the works that were completely updated before the crash should have these changes saved. Anything partially done will not be saved. Tag mapping also will not be displayed. TODO: better crash handling lol.

### Code

Yes the code is kind of bad and disorganized and I don't know what I'm doing with styling or data fetching either.

Most types are stored in `src/app/global.d.ts` and are helpful for looking at how the database objects are handled. Enums are duplicated in `src/app/types.ts` and should be imported from there when being used in the code.

To add/remove statuses (for permission or for podfics & chapters), both enums (`global.d.ts` and `types.ts`) should be altered, as well as code and styling for `StatusBadge` in `src/app/ui`, the relevant CSS file being `ui.module.css`

There are a lot of debugging logs left in because they don't bother me and are useful sometimes

Helpful links:

- NextJS docs
- MUI docs
- SWR docs
- module css docs?
- tanstack table docs

Tech stack:

- NodeJS/NPM/TypeScript/React
- NextJS
- PostgreSQL for database, just using pg for database connection - may upgrade at some point, do have knex installed for a query builder
- TanStack Table for most of the data tables
- Handsontable for the Voiceteam tables
- Reactgrid still installed atm but not using it, was using for Voiceteam but was not full-featured enough. Will be removed at a future point. Works well for less full-featured tables

## Other

This was mostly created for me specifically, but if other people are interested in messing around with it, feel free to get in contact with me about issues or feature requests or anything.

Huge credit to MistbornHero for the [podfic spreadsheet template](https://archiveofourown.org/works/42051816/), which I used for a good while before this and gave me most of my mental model for podfic tracking and what it should look like. Anything cool in what this looks like is because of the spreadsheet haha
