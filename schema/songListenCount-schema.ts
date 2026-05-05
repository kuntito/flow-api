import { integer, pgTable } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";

const songListenCountTN = "songListenCount";
export const songListenCountTable = pgTable(
    songListenCountTN,
    {
        songId: integer("songId")
            .primaryKey()
            .references(
                () => songsTable.songId
            ),
        listenCount: integer("listenCount")
            .notNull()
            .default(0),
    }
)

export type SongListenCountEntity = typeof songListenCountTable.$inferSelect;

export type SongListenCountInsertEntity = typeof songListenCountTable.$inferInsert;