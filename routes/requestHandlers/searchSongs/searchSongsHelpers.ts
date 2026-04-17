import { ilike, or } from "drizzle-orm";
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
        // TODO handle trimming
        const songSearchResults = await flowDb
            .select()
            .from(songsTable)
            .where(
                or(
                    ilike(songsTable.songTitle, `%${query}%`),
                    ilike(songsTable.songArtistName, `%${query}%`)
                )
            );

        return songSearchResults;

    } catch (e) {
        logDbError("search query failed", e);
        return [];
    }
}