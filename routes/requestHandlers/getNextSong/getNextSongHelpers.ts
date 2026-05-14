import { desc, eq, notInArray } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { getTotalSongCount } from "../../../helpers/songDbHelpers";
import { SongEntity, songsTable } from "../../../schema/song-schema";
import { songAndTagTable } from "../../../schema/songAndTag-schema";

const topListensPoolSize = 150;
const idealSongPoolSize = 150;
// TODO if i ever delete this tag, or modify it to mean something else, all hell could break lose
const RAP_TAG_ID = 4;


/**
 * it returns the least recently listened song.
 * 
 * 25% of the time, 
 * it returns a song from the most listened to songs, 
 * excluding songs tagged rap.
 * 
 * 75% of the time, it's from the lesser listened to songs.
 * 
 * during wind down hours, (6pm - 9am), 
 * songs tagged rap are excluded from lower listens too.
 */
export const getLeastRecentSong = async (

): Promise<SongEntity | null> => {
    const isWindDownTime = checkWindDownTime();
    const percent = getRandomPercent();

    let songEntity: SongEntity | null = null;
    if (percent < 25) {
        songEntity = await getLrsTopListens(true);
    } else {
        songEntity = await getLrsLowerListens(isWindDownTime);
    }

    return songEntity;
}


export const getRandomPercent = (): number => {
    const percent = Math.floor(Math.random() * 100);
    return percent;
}


/**
 * typically, after work, i wouldn't want to listen to rap songs.
 * 
 * and prefer, slower, mellow songs.
 * this checks the server time, converts it to my local time,
 * and returns a boolean, if it's wind down hours.
 */
const checkWindDownTime = (): boolean => {
    // converts server time to Nigerian time
    const nigeriaTime = new Date()
        .toLocaleString(
            "en-US", 
            {
                timeZone: "Africa/Lagos"
            }
        );
    
    const hour = new Date(nigeriaTime).getHours();
    
    // TODO probably shouldn't hardcode this here.
    return hour >= 18 || hour < 9;
}


const getRapSongIds = async (

): Promise<number[]> => {
    try {
        const rows = await flowDb
            .select({ 
                songId: songAndTagTable.songId 
            })
            .from(songAndTagTable)
            .where(
                eq(
                    songAndTagTable.tagId,
                    RAP_TAG_ID
                )
            );

        return rows.map(
            r => r.songId
        );
    } catch (e) {
        logDbError(
            "couldn't fetch rap song ids",
            e
        );
        return [];
    }
};


const getLrsTopListens = async (
    excludeRap: boolean,
): Promise<SongEntity | null> => {
    const rapSongIds = excludeRap ? await getRapSongIds() : [];

    try {
        const rowsTopListens = await flowDb
            .select()
            .from(songsTable)
            .where(
                // `notInArray` with an empty array can behave unexpectedly, hence the length check.
                rapSongIds.length > 0
                    ? notInArray(songsTable.songId, rapSongIds)
                    : undefined
            )
            .orderBy(
                desc(songsTable.listenCount)
            )
            .limit(topListensPoolSize);
    
        if (rowsTopListens.length === 0) return null;
    
        rowsTopListens.sort((a, b) => a.recency - b.recency);
    
        return rowsTopListens[0];
    } catch (e) {
        logDbError(
            "couldn't fetch least recent song from top listens",
            e
        )
    }

    return null;
}


/**
 * calculates pool size for lower listened songs.
 * 
 * if total song count is less than ideal pool size, use all songs as pool.
 * else, use the pool size is whatever's larger between
 * 
 * - total songs, after top listens are removed, 
 * OR
 * - ideal pool size
 * 
 * this way, the pool size is at least ideal whenever,
 * i can't remove all the top listens.
 * 
 */
const getLowerListensPoolSize = async (

): Promise<number> => {
    const totalSongsCount = await getTotalSongCount();

    if (totalSongsCount === 0) return 0;

    const lowerListensPoolSize = totalSongsCount < idealSongPoolSize
        ? totalSongsCount
        : Math.max(
            idealSongPoolSize,
            totalSongsCount - topListensPoolSize,
        );

    return lowerListensPoolSize;
}


const getLrsLowerListens = async (
    excludeRap: boolean
): Promise<SongEntity | null> => {

    const rapSongIds = excludeRap ? await getRapSongIds() : [];
    const lowerListensPoolSize = await getLowerListensPoolSize();

    try {
        const rowsLowerListens = await flowDb
            .select()
            .from(songsTable)
            .where(
                // `notInArray` with an empty array can behave unexpectedly, hence the length check.
                rapSongIds.length > 0
                    ? notInArray(songsTable.songId, rapSongIds)
                    : undefined
            )
            .orderBy(
                songsTable.listenCount
            )
            .limit(lowerListensPoolSize);

        if (rowsLowerListens.length === 0) return null;

        rowsLowerListens.sort(
            (a, b) => a.recency - b.recency
        );

        return rowsLowerListens[0];
    } catch (e) {
        logDbError(
            "couldn't fetch least recent song from lower listens",
            e
        )
    }

    return null;
}