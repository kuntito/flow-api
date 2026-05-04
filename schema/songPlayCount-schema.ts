import { integer, pgTable } from "drizzle-orm/pg-core";
import { songsTable } from "./song-schema";

const songPlayCountTN = "songPlayCount";
export const songPlayCountTable = pgTable(
    songPlayCountTN,
    {
        songId: integer("songId")
            .primaryKey()
            .references(
                () => songsTable.songId
            ),
        playCount: integer("playCount")
            .notNull()
            .default(0),
    }
)

export type SongPlayCountEntity = typeof songPlayCountTable.$inferSelect;

export type SongPlayCountInsertEntity = typeof songPlayCountTable.$inferInsert;