import { flowDb } from "../../../../clients/neonDbClient";
import { isPgUniqueViolation, logDbError } from "../../../../helpers/dbHelpers";
import { SongAndTagEntity, songAndTagTable } from "../../../../schema/songAndTag-schema";


export const addTagToSongInDb = async (
    songAndTagEntity: SongAndTagEntity
): Promise<boolean> => {
    try {
        await flowDb
            .insert(songAndTagTable)
            .values(songAndTagEntity);
        return true;
    } catch (e) {
        // if tag already exists on song, it's all good
        if (isPgUniqueViolation(e)) {
            return true
        }

        logDbError(
            "addTagToSongInDb failed",
            e
        );
    }

    return false;
}