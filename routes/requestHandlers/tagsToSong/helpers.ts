import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { songsTable } from "../../../schema/song-schema";
import { songTagTypesTable } from "../../../schema/songTagTypes-schema";
import { eq } from "drizzle-orm";

export const doesSongTagExist = async (
    tagId: number
): Promise<boolean> => {
    try {
        const resultRows = await flowDb
            .select()
            .from(songTagTypesTable)
            .where(
                eq(
                    songTagTypesTable.tagId,
                    tagId
                )
            )
            .limit(1);

        return resultRows.length > 0;
    } catch (e) {
        logDbError(
            "doesTagExist query failed",
            e
        );
    }

    return false;
}


export const doesSongExist = async (
    songId: number
): Promise<boolean> => {
    try {
        const result = await flowDb
        .select()
        .from(songsTable)
        .where(
            eq(
                songsTable.songId,
                songId,
            )
        )
        .limit(1);

        return result.length > 0;
    } catch (e) {
        logDbError(
            "doesSongExist query failed",
            e
        );
    }

    return false;
}