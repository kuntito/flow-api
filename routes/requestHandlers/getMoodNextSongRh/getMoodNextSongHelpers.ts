import { and, eq } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { SongEntity, songsTable } from "../../../schema/song-schema";
import { logDbError } from "../../../helpers/dbHelpers";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";


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
                songTagMatchTable,
                and(
                    eq(
                        songsTable.songId,
                        songTagMatchTable.songId,
                    ),
                    eq(
                        songTagMatchTable.isMatch,
                        true
                    )
                )
            )
            .where(
                eq(
                    songTagMatchTable.tagId,
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