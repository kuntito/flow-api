import { eq, sql, gte, and } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { Mood } from "../../../models/Mood";
import { songTagTypesTable } from "../../../schema/songTagTypes-schema";
import { logDbError } from "../../../helpers/dbHelpers";
import { songsTable } from "../../../schema/song-schema";
import { MOOD_DURATION_MS } from "../../../util/constants";
import { SongTagAndDuration } from "../../../models/SongTagAndDuration";
import ms from "ms";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";

/**
 * a mood is only valid, if there's enough playback minutes.
 */
export const getAllMoods = async (

): Promise<Mood[] | null> => {

    const songTagAndDuration = await getSongTagsAndDuration();
    if (songTagAndDuration == null) {
        return null;
    }

    return songTagAndDuration
        .filter(snd => snd.totalDurationMillis >= MOOD_DURATION_MS)
        .map( snd => {
            return {
                tagId: snd.tagId,
                moodName: snd.tagName,
                // TODO impl mapping each mood to duration
                durationMillis: snd.tagName === 'wind-down'
                    ? ms("90m")
                    : MOOD_DURATION_MS
            }
        });
}


/**
 * maps song tag types to the total duration of their songs.
 */
const getSongTagsAndDuration = async (

): Promise<SongTagAndDuration[] | null> => {
    const totalDurationMillis = sql<number>`
        SUM(${songsTable.songDurationMillis})
    `.mapWith(Number);

    try {
        const rows = await flowDb
            .select({
                tagId: songTagTypesTable.tagId,
                tagName: songTagTypesTable.tagName,
                totalDurationMillis: totalDurationMillis,
            })
            .from(songTagTypesTable)
            .innerJoin(
                songTagMatchTable,
                eq(
                    songTagTypesTable.tagId,
                    songTagMatchTable.tagId,
                ),
            )
            .innerJoin(
                songsTable,
                and(
                    eq(
                        songTagMatchTable.songId,
                        songsTable.songId
                    ),
                    eq(
                        songTagMatchTable.isMatch,
                        true
                    )
                )
            )
            .groupBy(
                songTagTypesTable.tagId,
                songTagTypesTable.tagName
            );

        return rows.map(r => ({
            tagId: r.tagId,
            tagName: r.tagName,
            totalDurationMillis: r.totalDurationMillis
        }));
    } catch (e) {
        logDbError(
            "couldn't fetch moods",
            e
        )
    }

    return null;
}