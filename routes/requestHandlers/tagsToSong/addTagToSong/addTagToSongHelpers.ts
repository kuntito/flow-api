import { flowDb } from "../../../../clients/neonDbClient";
import { logDbError } from "../../../../helpers/dbHelpers";
import { SongTagMatchEntity, songTagMatchTable } from "../../../../schema/songTagMatch-schema";
import { SongTagPair } from "../../../types/SongTagPair";


export const addTagToSongInDb = async (
    songTagPair: SongTagPair
): Promise<boolean> => {
    const { songId, tagId } = songTagPair;

    try {
        const songTagMatchEntity: SongTagMatchEntity = {
            songId: songId,
            tagId: tagId,
            isMatch: true,
        }
        await flowDb
            .insert(songTagMatchTable)
            .values(songTagMatchEntity)
            .onConflictDoUpdate({
                target: [
                    songTagMatchTable.songId,
                    songTagMatchTable.tagId,
                ],
                set: {
                    isMatch: true
                }
            });
        return true;
    } catch (e) {

        logDbError(
            "addTagToSongInDb failed",
            e
        );
    }

    return false;
}