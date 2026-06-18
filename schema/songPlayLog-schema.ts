import { pgTable, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";

// TODO rename this to song request table
export const songPlayLogTN = "songPlayLog";
export const songPlayLogTable = pgTable("songPlayLog", {
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

export type SongPlayLogEntity = typeof songPlayLogTable.$inferSelect;
export type SongPlayLogInsertEntity = typeof songPlayLogTable.$inferInsert;