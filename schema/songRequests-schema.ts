import { pgTable, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";

// TODO perhaps better name, these are songs the API sends
export const songRequestsTN = "songRequests";
export const songRequestsTable = pgTable(songRequestsTN, {
    id: serial("id")
        .primaryKey(),
    songId: integer("songId")
        .notNull()
        .references(
            () => songsTable.songId,
            {
                onDelete: 'cascade',
            }
        ),
    playedAt: timestamp("playedAt")
        .notNull()
        .defaultNow()
});

export type SongPlayLogEntity = typeof songRequestsTable.$inferSelect;
export type SongPlayLogInsertEntity = typeof songRequestsTable.$inferInsert;