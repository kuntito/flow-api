import { eq } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { SongEntity, songsTable } from "../../../schema/song-schema";
import { songAndTagTable } from "../../../schema/songAndTag-schema";
import { logDbError } from "../../../helpers/dbHelpers";


export const moodGetLeastRecentSong = async (
    tagId: number,
): Promise<SongEntity | null> => {
    try {
        const rowsMoodSongs = await flowDb
            .select({
                song: songsTable,
            })
            .from(songsTable)
            .innerJoin(
                songAndTagTable,
                eq(
                    songsTable.songId,
                    songAndTagTable.songId,
                )
            )
            .where(
                eq(
                    songAndTagTable.tagId,
                    tagId
                )
            )
            .orderBy(
                songsTable.recency
            )
            .limit(1);

        if (rowsMoodSongs.length == 0) return null;

        return rowsMoodSongs[0].song;
    } catch(e) {
        logDbError(
            `coudln't fetch mood song for tagId=${tagId}`,
            e
        )
    }

    return null;
}