import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import { playlistsTable } from "./playlist-schema";
import { songsTable } from "./song-schema";

export const playlistSongsTN = "playlistSongs"
export const playlistSongsTable = pgTable(playlistSongsTN, {
    playlistId: integer("playlistId")
        .notNull()
        .references(
            () => playlistsTable.playlistId,
            { onDelete: "cascade" },
        ),
    songId: integer("songId")
        .notNull()
        .references(
            () => songsTable.songId,
        ),
}, (table) => ([
    primaryKey({
        columns: [
            table.playlistId,
            table.songId,
        ],
    }),
]));

export type PlaylistSongEntity = typeof playlistSongsTable.$inferSelect;

export type PlaylistSongInsertEntity = typeof playlistSongsTable.$inferInsert;