import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";
import { eq, sql } from "drizzle-orm";
import { SongTagType } from "../../types/SongTagType";
import { getTotalSongCount } from "../../../helpers/songDbHelpers";
import { songTagTypesTable } from "../../../schema/songTagTypes-schema";

export const fetchSongTagsWithUntaggedSongs = async (

): Promise<SongTagType[] | null> => {
    const totalSongs = await getTotalSongCount();
    if (totalSongs == null) return null;

    try {

        const rows = await flowDb
            .select({
                tagId: songTagTypesTable.tagId,
                tagName: songTagTypesTable.tagName,
                tagDescription: songTagTypesTable.tagDescription,
                taggedCount: sql<number>`count(${songTagMatchTable.songId})`
                    .mapWith(Number),
            })
            .from(songTagTypesTable)
            .leftJoin(
                songTagMatchTable,
                eq(
                    songTagTypesTable.tagId,
                    songTagMatchTable.tagId
                )
            )
            .groupBy(
                songTagTypesTable.tagId,
                songTagTypesTable.tagName,
                songTagTypesTable.tagDescription
            )
            .having(
                sql`count(${songTagMatchTable.songId}) < ${totalSongs}`
            );

        return rows.map(r => ({
            tagId: r.tagId,
            tagName: r.tagName,
            tagDescription: r.tagDescription,
        }));

    } catch (e) {
        logDbError(
            "couldn't fetch song tags with untagged songs",
            e
        );
    }
    return null;
}