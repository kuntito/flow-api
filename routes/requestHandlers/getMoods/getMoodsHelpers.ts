import { eq, sql, gte } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { Mood } from "../../../models/Mood";
import { songTagTypesTable } from "../../../schema/songTagTypes-schema";
import { logDbError } from "../../../helpers/dbHelpers";
import { songsTable } from "../../../schema/song-schema";
import { songAndTagTable } from "../../../schema/songAndTag-schema";
import { MOOD_DURATION_MS } from "../../../util/constants";
import { SongTagAndDuration } from "../../../models/SongTagAndDuration";

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
        .map( snd => ({
            tagId: snd.tagId,
            moodName: snd.tagName,
            durationMillis: MOOD_DURATION_MS
        }));
}


/**
 * maps it song tag to the total duration of all songs tagged.
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
                songAndTagTable,
                eq(
                    songTagTypesTable.tagId,
                    songAndTagTable.tagId,
                )
            )
            .innerJoin(
                songsTable,
                eq(
                    songAndTagTable.songId,
                    songsTable.songId
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