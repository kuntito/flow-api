import { ilike, or } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { SongEntity, songsTable } from "../../../schema/song-schema";



/**
 * searches db for songs where query is in song title
 */
export const searchDbForSongs = async (
    query: string,
): Promise<SongEntity[] | null> => {
    try {
        // TODO implement subsequence search.
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
    }
    return null;
}



export const getAllSongs = async (

): Promise<SongEntity[] | null> => {
    try {
        return await flowDb
            .select()
            .from(songsTable);
    } catch (e) {
        logDbError(
            "couldn't fetch all songs",
            e
        );
    }
    return null;
}