import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";
import { tagTypesTable } from "./tagTypes-schema";

export const songsAndTagTN = "songs_and_tag";
export const songAndTagTable = pgTable(songsAndTagTN, {
    songId: integer("song_id")
        .notNull()
        .references(() => songsTable.songId),
    tagName: text("tag_name")
        .notNull()
        .references(() => tagTypesTable.tagName),
}, (table) => ([
    primaryKey({ columns: [
        table.songId,
        table.tagName
    ]})
]));