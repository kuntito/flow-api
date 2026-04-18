import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";
import { songTagTypesTable } from "./songTagTypes-schema";

export const songsAndTagTN = "songAndTag";
export const songAndTagTable = pgTable(songsAndTagTN, {
    songId: integer("song_id")
        .notNull()
        .references(() => songsTable.songId),
    tagName: text("tag_name")
        .notNull()
        .references(() => songTagTypesTable.tagName),
}, (table) => ([
    primaryKey({ columns: [
        table.songId,
        table.tagName
    ]})
]));

export type SongAndTagEntity = typeof songAndTagTable.$inferSelect;