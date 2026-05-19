import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";
import { songTagTypesTable, songTagTypesTN } from "./songTagTypes-schema";


export const songsNotTagTN = "songsNotTag";
// these are songs, i've said aren't a particular tag
// i.e. Halsey's without me, is not a rap song.
// i use this to know songs that i've haven't considered for a particular tag.
export const songsNotTagTable = pgTable(
    songsNotTagTN,
    {
        songId: integer("song_id")
            .notNull()
            .references(() => songsTable.songId),
        tagId: integer("tag_id")
            .notNull()
            .references(() => songTagTypesTable.tagId),
    },
    (table) => ([
        primaryKey({
            columns: [
                table.songId,
                table.tagId
            ]
        })
    ])
);

export type SongNotTagEntity = typeof songsNotTagTable.$inferSelect;