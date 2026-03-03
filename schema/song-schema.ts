import { pgTable, integer, serial, text } from "drizzle-orm/pg-core";

export const songsTable = pgTable("songs", {
    // the API working correctly demands songId to be auto-incrementing
    // the next song is always the next largest songId.
    // any changes to this field should account for that.
    songId: serial("id").primaryKey(),
    songS3Key: text("s3Key").notNull().unique(),
    songTitle: text("title").notNull(),
    songArtistName: text("artist").notNull(),
    songAlbumArtUrl: text("albumArtUrl").notNull(),
    songDurationMillis: integer("durationMillis").notNull(),
});

export type SongEntity = typeof songsTable.$inferSelect; 




export const currentSongTable = pgTable("currentSong", {
    rowId: integer("rowId").primaryKey().default(1),
    songId: integer("songId").references(() => songsTable.songId),
});