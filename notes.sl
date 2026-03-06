** PROJECT-SETUP **

+   to setup the project in cwd:
    `npm init -y`

    this creates a `package.json` file

+   to setup repo:
    `git init`

+   create `/.gitignore`
    add:
    `
    node_modules
    .env
    .cursorrules
    package-lock.json
    .vscode/settings.json
    `

+   web framework for handling routes:
    `npm install express`

+   typescript compiler (local):
    `npm install -D typescript`

+   runs typescript files directly without compiling:
    `npm install -D ts-node`

+   auto-restarts server on file changes:
    `npm install -D nodemon`

+   typescript type definitions for node.js:
    `npm install -D @types/node`

+   typescript type definitions for express:
    `npm install -D @types/express`

+   loads environment variables from .env file:
    `npm install dotenv`

+   aws s3 client for bucket operations:
    `npm install @aws-sdk/client-s3`

+   generates signed urls for private s3 objects:
    `npm install @aws-sdk/s3-request-presigner`

+   in project root, create `tsconfig.json`
    copy content from my google drive `G:\My Drive\0\tsconfig.json`

+   in project root, create `server.ts`

+   in `server.ts`, add:
    `
import express, { Express } from "express";

const app: Express = express();
// TODO ensure PORT doesn't clash with other projects
const PORT = 5003;

// allows project to parse JSON in request body
app.use(express.json());

app.listen(PORT, () => {
    console.log(`server started at http://localhost:${PORT}`);
})
    `

+   to start server with `npm run dev`,
    in `package.json`, go to the `scripts` tag and add:

    `
    {
        ...,
        "scripts": {
            ...,
            "dev": "nodemon server.ts"
        },
        ...
    }
    `

    `nodemon` is the command.
    `server.ts` is the relative file path

** NEON SETUP (POSTGRES) **
+   create acount:
    `https://neon.tech`

+   create new project:
    - postgres version: 17 (default)
    - cloud service: AWS
    - region: default

+   you would need a connection string.
    click "Connect" (top right corner at time of writing)

    a dialog would appear.

    with a text like:
    `psql 'postgresql://...some other things...'`

    everything within the single quotes is the connection string.

    add this string to env variables, `.env`.
    `NEON_CONN_STR=postgre...`


+   postgres client for node.js:
    `npm i pg`

+   ts type definitions for `pg`:
    `npm i -D @types/pg`

+   next, setup drizzle.
    it serves a single source of truth for the SQL schema
    and TS types.

    you define the schema once, drizzle infers the types.

** DRIZZLE ORM **
+   `npm install drizzle-orm`
    `npm install -D drizzle-kit`

+   to create a table, see `.schema/song-schema.ts`:

`
import { pgTable, integer, serial, text } from "drizzle-orm/pg-core";

export const songsTable = pgTable("songs", {
    songId: serial("id").primaryKey(),
    songS3Key: text("s3Key").notNull().unique(),
    songTitle: text("title").notNull(),
    songArtistName: text("artist").notNull(),
    songAlbumArtUrl: text("albumArtUrl").notNull(),
    songDurationMillis: integer("durationMillis").notNull(),
});

export type SongEntity = typeof songsTable.$inferSelect; 
`

+   you'd need a config file in project root i.e. `.drizzle.config.ts`
`
import { defineConfig } from 'drizzle-kit';
import { envConfig } from './envConfig';

export default defineConfig({
    schema: "./schema/song-schema.ts",
    dialect: "postgresql",
    dbCredentials: {
        url: envConfig.NEON_CONN_STR
    }
});
`

+   then in terminal, create the tables in your neon account:
    `npx drizzle-kit push`


** DEPENDENCIES **
+   handles file uploads and saves to temporary location
    `npm install multer`
    `npm install -D @types/multer`

+   to read music file metadata, supported extensions: (mp3, m4a, flac, wav, ogg):
    `npm install music-metadata`

** MISC **
+   running node files in terminal:
    `npx ts-node filename.ts`

    where `filename.ts` is the filepath, 
    this assumes you've cd'd into the root dir for `filename.ts`.