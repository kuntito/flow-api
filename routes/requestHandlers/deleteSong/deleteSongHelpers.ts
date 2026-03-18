import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { safeDeleteSongFromDb } from "../../../helpers/songDbHelpers";
import { nextSongTable } from "../../../schema/nextSong-schema";
import { songQueueTable } from "../../../schema/songQueue-schema";
import { eq, gt } from "drizzle-orm";


/**
 * deletes song from db,
 * addresses edge case where deleted song is next in queue.
 * 
 * it updates the next song in queue.
 * 
 * returns true if song is deleted from db.
 * false, for every other case.
 */
export const handleDeleteSong = async (
    songId: number
): Promise<boolean> => {
    const maybeNextSongPosition = await getSongPosIfNext(songId);

    const isDeletedFromDb = await safeDeleteSongFromDb(songId);

    if (isDeletedFromDb && maybeNextSongPosition != null) {
        await updateNextSongInQueue(maybeNextSongPosition);
    }

    return isDeletedFromDb;
}


/**
 * returns the song's position in the song queue, if it exists.
 * 
 * and null, for every other case.
 */
const grabSongPosInQueue = async (
    songId: number,
): Promise<number | null> => {
    try {
        const resultRows = await flowDb
            .select({ pos: songQueueTable.pos })
            .from(songQueueTable)
            .where(eq(songQueueTable.songId, songId))
            .limit(1);

        return resultRows[0]?.pos ?? null;
    } catch (e) {
        logDbError(
            `couldn't grab song position from queue, songId: ${songId}`,
            e
        );
    }
    
    return null;
}


/**
 * `nextSongTable` holds the queue position for the next song.
 * 
 * this returns that position, if it exists.
 * null, otherwise.
 */
const grabNextSongPos = async (

): Promise<number | null> => {
    try {
        const resultRows = await flowDb
            .select({ nextSongPos: nextSongTable.posInQueue})
            .from(nextSongTable)
            .limit(1);

        return resultRows[0]?.nextSongPos ?? null;
    } catch(e) {
        logDbError(
            `couldn't grab next song queue position`,
            e
        );
    }

    return null;
}


/**
 * this checks if the song is next in queue.
 * 
 * if yes, returns the queue position
 * else, returns null.
 */
const getSongPosIfNext = async (
    songId: number
): Promise<number | null> => {

    const songPosInQueue = await grabSongPosInQueue(songId);
    if (songPosInQueue != null) {
        const nextSongPos = await grabNextSongPos();
        if (nextSongPos != null && nextSongPos === songPosInQueue){
            return nextSongPos
        }
    }
    
    return null;
}


/**
 * this is called if the deleted song was next in queue.
 * 
 * in this case, the nextSongTable would be empty.
 * since deletes cascade.
 * 
 * this fn inserts the next position into `nextSongTable`.
 * if something goes wrong, it fails silently.
 * 
 * `getNextSong` is designed to initialize `nextSongTable` if it's empty.
 * 
 * in the failure case, it'd restart the queue with position `0`.
 */
const updateNextSongInQueue = async (curPos: number) => {
    try {
        const resultRows = await flowDb
            .select({ pos: songQueueTable.pos})
            .from(songQueueTable)
            .where(gt(songQueueTable.pos, curPos))
            .orderBy(songQueueTable.pos)
            .limit(1);

        const nextPos = resultRows[0]?.pos;

        if (nextPos != null) {
            await flowDb
                .insert(nextSongTable)
                .values({
                    posInQueue: nextPos
                });
        }

    } catch (e) {
        logDbError(
            "couldn't update next song in queue",
            e
        )
    }
}
