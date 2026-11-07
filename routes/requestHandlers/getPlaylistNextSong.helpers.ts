import { asc } from "drizzle-orm";
import { flowDb } from "../../clients/neonDbClient";
import { ValidationResult } from "../../util/validation";
import { isValidId } from "../helpers";
import { SongEntity, songsTable } from "../../schema/song-schema";
import { playlistSongsTable } from "../../schema/playlistSongs-schema";
import { eq } from "drizzle-orm";
import { logDbError } from "../../helpers/dbHelpers";


export const validatePlaylistId = (
    playlistIdStr: unknown,
): ValidationResult<number> => {
    const playlistId = Number(playlistIdStr);

    if (!isValidId(playlistId)) {
        return {
            isValid: false,
            reason: `playlist id must be a whole number above zero, it is ${playlistIdStr}`,
        };
    }

    return {
        isValid: true,
        data: playlistId,
    };
}


/**
 * the playlist's least recently played song.
 *
 * returns null
 *  if the playlist is empty, doesn't exist,
 *  or anything goes wrong.
 */
export const getLeastRecentPlaylistSong = async (
    playlistId: number,
): Promise<SongEntity | null> => {
    try {
        const rows = await flowDb
            .select()
            .from(songsTable)
            .innerJoin(
                playlistSongsTable,
                eq(
                    playlistSongsTable.songId,
                    songsTable.songId
                )
            )
            .where(
                eq(
                    playlistSongsTable.playlistId,
                    playlistId
                )
            )
            .orderBy(
                asc(songsTable.recency),
            )
            .limit(1);

        if (rows.length === 0) {
            return null;
        }

        const songEntity: SongEntity = rows[0].songs;

        return songEntity;

    } catch (e) {
        logDbError(
            "couldn't get the least recent song from playlist",
            e
        );
    }

    return null;
}