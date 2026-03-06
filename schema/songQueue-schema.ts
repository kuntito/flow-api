import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";

export const songQueueTable = pgTable("songQueue", {
    // the queue design hinges on the pos being an auto-incrementing integer
    // any modifications should account for this
    pos: serial("pos").primaryKey(),
    songId: integer("songId").references(() => songsTable.songId),
})