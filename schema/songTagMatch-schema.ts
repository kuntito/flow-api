import { boolean, integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";
import { songTagTypesTable } from "./songTagTypes-schema";


export const songTagMatchTn = "songTagMatch";
export const songTagMatchTable = pgTable(
    songTagMatchTn, 
    {
        songId: integer("song_id")
            .notNull()
            .references(
                () => songsTable.songId,
                {
                    onDelete: 'cascade'
                }
            ),
        tagId: integer("tag_id")
            .notNull()
            .references(() => songTagTypesTable.tagId),
        isMatch: boolean("is_match")
            .notNull()
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

export type SongTagMatchEntity = typeof songTagMatchTable.$inferSelect;
export type SongTagMatchInsertEntity = typeof songTagMatchTable.$inferInsert;