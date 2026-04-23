import { ilike, or } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { SongEntity, songsTable } from "../../../schema/song-schema";


type ValidateSearchQueryReturn = 
    | { success: true; validatedQuery: string }
    | { success: false; reason: string; };

export const validateSearchQuery = (
    query: string
): ValidateSearchQueryReturn => {

    if (query === undefined) {
        return {
            success: false,
            reason: "search query is required",
        };
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery === '') {
        return {
            success: false,
            reason: "search query cannot be blank"
        }
    };

    return {
        success: true,
        validatedQuery: trimmedQuery
    }
}

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
                or(
                    ilike(songsTable.songTitle, `%${query}%`),
                    ilike(songsTable.songArtistName, `%${query}%`)
                )
            );

        return songSearchResults;

    } catch (e) {
        logDbError("search query failed", e);
        // TODO you want to return an error, not empty list.
        // the empty list hides any errors that occur.
        return [];
    }
}