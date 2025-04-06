# Podfic Tracker Database

Database & web app for podfic tracking, focusing on project progress tracking, statistics, and HTML generation for AO3 posts.

Note: This is very much a work in progress and some things may work strangely or not at all. There is an assumption of some technical knowledge/ability to figure things out - you will at least need to be able to create and manage a PostgreSQL database and run a Node project.

## Setup

### Database

Create a PostgreSQL database called "podfic-tracker-db" with an owner called
"podfic-tracker-db_owner". Use the DDL in `src/db` to set up the tables & relationships & routines.

I like to use DataGrip or DBeaver to help manage manual database things. DataGrip is a paid tool, though it has a good free trial, and DBeaver has both free and paid options but the free option has been sufficient for everything I've needed for this project.

#### Environment variables

Create a file in the project root directory named `.env` and put the connection string in it. Currently the project is set up to be able to switch between two databases (one being designated as local). It is not necessary to have two databases set up; both strings can be the same, or you can only define one and make sure that `USE_LOCAL` points to it. The relevant variables are:

- `CONNECTION_STRING` for non-local database connection string
- `CONNECTION_STRING_LOCAL` for local database connection string
- `USE_LOCAL` to designate which database should be used; set to '0' for non-local database, '1' for local database.

#### Manual Setup

Some stuff will need to be manually set up:

- Create a podficcer in the `podficcer` table for yourself. Some things assume a podficcer with the id of `1` already exists, so this is why.
- It is possible some pages will crash if there's nothing in the database, you may need to manually create some podfics, etc.
- For Voiceteams, you need to manually create a `voiceteam_event` for each `event` that is a Voiceteam that you want to do voiceteam-specific things for. If you don't, when you try to click into that Voiceteam the app will rerender infinitely and probably crash. Yes this is bad no I don't currently have plans to fix it. TODO: add a dummy Voiceteam event to base yours off of?

### App

Have node and npm installed. [insert relevant links?] In the project root directory, run `npm install`. Run `npm run dev` to run the project. Probably possible to build? Haven't done that yet. Project is at `http://localhost:3001`.

## Usage

TODO: separate md file for this? wiki?

App performance is kinda suboptimal right now, it's a work in progress. Data will almost certainly load faster if you are using a local database. Pages will take a little while to render when you first go to them after running the app, but should load more quickly thereafter. Some changes to data can take a little while to show up, and loading state is not always clear on new pages; be patient.

TODO: mention the update metadata script & env variables & json file for it

### UI

Most things should be self-explanatory. [add various clarifying things]

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
NodeJS/NPM/TypeScript/React
NextJS
PostgreSQL for database, just using pg for database connection - may upgrade at some point, do have knex installed for a query builder
TanStack Table for most of the data tables
Handsontable for the Voiceteam tables
Reactgrid still installed atm but not using it, was using for Voiceteam but was not full-featured enough. Will be removed at a future point. Works well for less full-featured tables

## Other

This was mostly created for me specifically, but if other people are interested in messing around with it, feel free to get in contact with me about issues or feature requests or anything.

Huge credit to MistbornHero for the [podfic spreadsheet template](https://archiveofourown.org/works/42051816/), which I used for a good while before this and gave me most of my mental model for podfic tracking and what it should look like. Anything cool in what this looks like is because of the spreadsheet haha
