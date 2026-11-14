import { sql } from "drizzle-orm";
import { pgTable, text, check, integer, boolean } from "drizzle-orm/pg-core";

export const playlistsTN = "playlists"
export const playlistsTable = pgTable(playlistsTN, {
    playlistId: integer("id")
        .primaryKey(),
    playlistName: text("name")
        .unique()
        .notNull(),
    isAuto: boolean("isAuto")
        .notNull()
        .default(false),
}, (table) => ([
    check(
        "playlist_name_not_empty",
        sql`trim(${table.playlistName}) <> ''`
    ),
]));

export type PlaylistEntity = typeof playlistsTable.$inferSelect;

export type PlaylistInsertEntity = typeof playlistsTable.$inferInsert;