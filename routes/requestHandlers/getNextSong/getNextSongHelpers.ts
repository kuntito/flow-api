import { flowDb } from "../../../clients/neonDbClient";
import { SongEntity, songsTable } from "../../../schema/song-schema";
import { logDbError } from "../../../helpers/dbHelpers";


/**
 * all songs have a recency field, a number that indicates
 * the last time each song was accessed.
 * 
 * fn sorts by recency in ascending order
 * and returns the first song entity.
 */
export const getLeastRecentSong = async (

): Promise<SongEntity | null> => {
    try {
        const resultRows = await flowDb
            .select()
            .from(songsTable)
            .orderBy(songsTable.recency)
            .limit(1);

        return resultRows[0] ?? null;
    } catch (e) {
        logDbError(
            "couldn't fetch least recent song",
            e
        )
    }
    return null;
}
