import { flowDb } from "../../../../clients/neonDbClient";
import { isPgUniqueViolation, logDbError } from "../../../../helpers/dbHelpers";
import { SongNotTagEntity, songsNotTagTable } from "../../../../schema/songNotTag-schema";


export const addNotTagToSongInDb = async (
    songNotTagEntity: SongNotTagEntity
): Promise<boolean> => {
    try {
        await flowDb
            .insert(songsNotTagTable)
            .values(songNotTagEntity);

        return true;
    } catch (e) {
        // if song already tagged, it's all good.
        if (isPgUniqueViolation(e)) {
            return true;
        }

        logDbError(
            "addNotTagToSongInDb failed",
            e
        );
    }

    return false;
}