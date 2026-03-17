import { ilike } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { SongEntity, songsTable } from "../../../schema/song-schema";


/**
 * searches db for songs where query is in song title
 */
export const searchDbForSongs = async (
    query: string,
): Promise<SongEntity[]> => {
    try {
        // TODO implement subsequence search.
        const songSearchResults = await flowDb
            .select()
            .from(songsTable)
            .where(
                ilike(songsTable.songTitle, `%${query}%`)
            );

        return songSearchResults;

    } catch (e) {
        logDbError("search query failed", e);
        return [];
    }
}