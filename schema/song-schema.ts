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
export type SongInsertEntity = typeof songsTable.$inferInsert;