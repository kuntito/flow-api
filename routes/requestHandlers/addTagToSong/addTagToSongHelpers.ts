import { eq } from "drizzle-orm"
import { flowDb } from "../../../clients/neonDbClient"
import { songTagTypesTable } from "../../../schema/songTagTypes-schema"
import { isPgUniqueViolation, logDbError } from "../../../helpers/dbHelpers";
import { songsTable } from "../../../schema/song-schema";
import { SongAndTagEntity, songAndTagTable } from "../../../schema/songAndTag-schema";

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