import { pgTable, serial, uuid, integer, bigint } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";

export const listenHistoryTN = "listenHistory";
export const listenHistoryTable = pgTable(listenHistoryTN, {
    seq: serial("seq")
        .primaryKey(),
    eventId: uuid("eventId")
        .notNull()
        .unique(),
    songId: integer("songId")
        .notNull()
        .references(
            () => songsTable.songId,
        ),
    listenedAt: bigint(
        "listenedAt",
        {
            mode: "number"
        })
        .notNull(),
})

export type ListenHistoryEntity = typeof listenHistoryTable.$inferSelect;

export type ListenHistoryInsertEntity = typeof listenHistoryTable.$inferInsert;