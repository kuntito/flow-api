import ms from "ms";
import { SongEntity, songsTable } from "../schema/song-schema";
import { toSongWithUrl } from "../routes/types/SongWithUrl";
import { SongWithUrl } from "../routes/types/SongWithUrl";
import { getSignedObjectUrlS3 } from "./s3Helpers";
import { flowDb } from "../clients/neonDbClient";
import { eq } from "drizzle-orm";
import { logDbError } from "./dbHelpers";
import { songPlayLogTable } from "../schema/songPlayLog-schema";

/**
 * an abstraction over the `ms` npm package,.
 * converts a duration string to seconds.
 *
 * @param value - A duration string (e.g. "1s", "5m", "2h")
 * @returns the duration in seconds
 */
export function secs(value: ms.StringValue): number {
    return ms(value) / 1000;
}



/**
 * shuffles an array in-place.
 */
export const shuffleArray = (array: any[]) => {
    let currentIndex = array.length;

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [
            array[currentIndex],
            array[randomIndex]
        ] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
};

/**
 * updates the song's recency to now.
 * used to track which song was last accessed.
 */
const updateSongRecency = async (
    songId: number
) => {
    try {
        await flowDb
            .update(songsTable)
            .set({ recency: Date.now() })
            .where(eq(songsTable.songId, songId));
    } catch (e) {
        logDbError(
            `couldn't update recency, songId: ${songId}`,
            e
        )
    }
}

const logSongRequest = async (songId: number): Promise<void> => {
    try {
        await flowDb
            .insert(songPlayLogTable)
            .values({ songId: songId });
    } catch (e) {
        logDbError(
            "couldn't log song request", 
            e
        );
    }
};


/**
 * updates recency and converts to client response model.
 * 
 * @param songEntity - the song to process
 */
export const prepareSongForClient = async (
    songEntity: SongEntity
): Promise<SongWithUrl> => {
    const songUrl = await getSignedObjectUrlS3(songEntity.songS3Key);
    
    updateSongRecency(songEntity.songId);
    await logSongRequest(songEntity.songId);

    const songWithUrl: SongWithUrl = toSongWithUrl(
        songEntity,
        songUrl,
    );
    
    return songWithUrl;
}


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
