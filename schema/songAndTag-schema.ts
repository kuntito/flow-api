import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";
import { songTagTypesTable } from "./songTagTypes-schema";

export const songsAndTagTN = "songAndTag";
export const songAndTagTable = pgTable(songsAndTagTN, {
    songId: integer("song_id")
        .notNull()
        .references(() => songsTable.songId),
    tagId: integer("tag_id")
        .notNull()
        .references(() => songTagTypesTable.tagId),
}, (table) => ([
    primaryKey({ columns: [
        table.songId,
        table.tagId
    ]})
]));

export type SongAndTagEntity = typeof songAndTagTable.$inferSelect;