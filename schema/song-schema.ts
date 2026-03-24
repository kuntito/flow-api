import { pgTable, integer, serial, text, bigint } from "drizzle-orm/pg-core";

// TODO make table name a variable `songsTN`
export const songsTable = pgTable("songs", {
    songId: serial("id").primaryKey(),
    songS3Key: text("s3Key").notNull().unique(),
    songTitle: text("title").notNull(),
    songArtistName: text("artist").notNull(),
    songAlbumArtUrl: text("albumArtUrl").notNull(),
    songDurationMillis: integer("durationMillis").notNull(),
    recency: bigint("recency", { mode: "number" }).notNull().default(0),
});

export type SongEntity = typeof songsTable.$inferSelect; 
export type SongInsertEntity = typeof songsTable.$inferInsert;