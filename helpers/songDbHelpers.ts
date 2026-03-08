import { flowDb } from "../clients/neonDbClient";
import { SongEntity, songsTable } from "../schema/song-schema";
import { eq } from "drizzle-orm";
import { logDbError } from "./dbHelpers";

/**
 * fetches a songEntity from the db.
 *
 * returns null, if anything goes wrong.
 */
export const safeGetSongFromDb = async (
    songId: number
): Promise<SongEntity | null> => {
    try {
        const res = await flowDb
            .select()
            .from(songsTable)
            .where(eq(songsTable.songId, songId))
            .limit(1);

        if (res.length === 1) {
            const songEntity = res[0];
            return songEntity;
        }

        console.log(`couldn't find songId in db, songId: ${songId}`);
        return null;
    } catch(e) {
        logDbError(
            `couldn't fetch song from db, songId: ${songId}`,
            e
        );
        return null;
    }
};


/**
 * deletes a song from db.
 */
export const safeDeleteSongFromDb = async (
    songId: number
): Promise<boolean> => {
    let isDeleted = false;

    try {
        const resultRows = await flowDb
            .delete(songsTable)
            .where(eq(songsTable.songId, songId));

        isDeleted = (resultRows.rowCount ?? 0) > 0;
    } catch (e) {
        logDbError(
            `couldn't delete song, songId: ${songId}`,
            e
        );
    }

    return isDeleted;
};