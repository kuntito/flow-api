import { pgTable, integer, serial, text, bigint } from "drizzle-orm/pg-core";

// TODO make table name a variable `songsTN`
// TODO add created at, to id new songs.
// listen history and count, can tell you if it's a new song you like
// rather than an upload of an old song.
export const songsTable = pgTable("songs", {
    songId: serial("id").primaryKey(),
    songS3Key: text("s3Key").notNull().unique(),
    songTitle: text("title").notNull(),
    songArtistName: text("artist").notNull(),
    songAlbumArtUrl: text("albumArtUrl").notNull(),
    songDurationMillis: integer("durationMillis").notNull(),
    recency: bigint("recency", { mode: "number" }).notNull().default(0),
    listenCount: integer("listenCount")
        .notNull()
        .default(0),
});

export type SongEntity = typeof songsTable.$inferSelect;

// contains all fields except the optional ones i.e. `songId`, `recency`
export type SongInsertEntity = typeof songsTable.$inferInsert;