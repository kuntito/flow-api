import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { songTagTypesTable } from "../../../schema/songTagTypes-schema";
import { SongTagType, toSongTag } from "../../types/SongTagType";

/**
 * fetches every tag type.
 * 
 * if something goes wrong, it returns null.
 */
export const fetchAllSongTags = async (

): Promise<SongTagType[] | null> => {
    try {
        const res = await flowDb
            .select()
            .from(songTagTypesTable);

        return res.map(toSongTag)
    } catch (e) {
        logDbError(
            "couldn't fetch song tags",
            e
        );
        return null;
    }
}