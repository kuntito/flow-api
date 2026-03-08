import { pgTable, integer } from "drizzle-orm/pg-core";
import { songQueueTable } from "./songQueue-schema";

export const nextSongTN = "nextSong";
/**
 * table with a single row, single column.
 * it references the position of the next song in the queue.
 */
export const nextSongTable = pgTable(
    nextSongTN,
    {
        posInQueue: integer("posInQueue")
            .primaryKey()
            .references(
                () => songQueueTable.pos,
                { onDelete: "cascade" },
            ),
});