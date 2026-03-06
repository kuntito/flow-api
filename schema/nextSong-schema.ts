import { pgTable, integer } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";

export const nextSongTable = pgTable("nextSong", {
    rowId: integer("rowId").primaryKey().default(1),
    songId: integer("songId").references(() => songsTable.songId),
});