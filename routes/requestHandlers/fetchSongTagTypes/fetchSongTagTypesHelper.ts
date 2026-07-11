import { eq, sql } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { getTotalSongCount } from "../../../helpers/songDbHelpers";
import { songTagTypesTable } from "../../../schema/songTagTypes-schema";
import { SongTagType, toSongTag } from "../../types/SongTagType";
import { SongTagTypeWithWork } from "./fetchSongTagTypesReqHandler";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";

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

/**
 * returns each tag with a boolean indicating
 * it has unaddressed songs.
 */
export const fetchAllSongTagsWithWork = async (

): Promise<SongTagTypeWithWork[] | null> => {
    const totalSongs = await getTotalSongCount();
    if (totalSongs == null) {
        return null;
    }

    try {
        const rows = await flowDb
            .select({
                tagId: songTagTypesTable.tagId,
                tagName: songTagTypesTable.tagName,
                tagDescription: songTagTypesTable.tagDescription,
                hasUnaddressed: sql<boolean>`count(${songTagMatchTable.songId}) < ${totalSongs}`,
            })
            .from(songTagTypesTable)
            .leftJoin(
                songTagMatchTable,
                eq(
                    songTagTypesTable.tagId,
                    songTagMatchTable.tagId,
                )
            )
            .groupBy(
                songTagTypesTable.tagId
            );

        return rows;
    } catch (e) {
        logDbError(
            "couldn't fetch song tags with work",
            e
        )
    }
    return null;
}