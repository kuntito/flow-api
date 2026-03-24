import ms from "ms";
import { SongEntity, songsTable } from "../schema/song-schema";
import { SongWithUrl, toSongWithUrl } from "../routes/requestHandlers/types";
import { getSignedObjectUrlS3 } from "./s3Helpers";
import { flowDb } from "../clients/neonDbClient";
import { eq } from "drizzle-orm";
import { logDbError } from "./dbHelpers";

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

/**
 * updates recency and converts to client response model.
 * 
 * @param songEntity - the song to process
 */
export const prepareSongForClient = async (
    songEntity: SongEntity
): Promise<SongWithUrl> => {
    updateSongRecency(songEntity.songId);

    const songUrl = await getSignedObjectUrlS3(songEntity.songS3Key);

    const songWithUrl: SongWithUrl = toSongWithUrl(
        songEntity,
        songUrl,
    );
    
    return songWithUrl;
}