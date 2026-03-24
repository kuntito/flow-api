import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { safeDeleteSongFromDb } from "../../../helpers/songDbHelpers";
import { eq, gt } from "drizzle-orm";


/**
 * deletes song from db.
 * 
 * returns true if song is deleted from db.
 * false, if not.
 */
export const handleDeleteSong = async (
    songId: number
): Promise<boolean> => {
    const isDeletedFromDb = await safeDeleteSongFromDb(songId);

    return isDeletedFromDb;
}