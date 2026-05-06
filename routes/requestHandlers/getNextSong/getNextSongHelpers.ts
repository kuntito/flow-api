import { flowDb } from "../../../clients/neonDbClient";
import { SongEntity, songsTable } from "../../../schema/song-schema";
import { logDbError } from "../../../helpers/dbHelpers";
import { desc } from "drizzle-orm";
import { getTotalSongCount } from "../../../helpers/songDbHelpers";

const topListensPoolSize = 150;
const idealSongPoolSize = 150;

/**
 * it returns the least recently listened song.
 * 
 * 85% of the time, it returns a song from the most listened to songs.
 * 15% of the time, it's from the lesser listened to songs.
 */
export const getLeastRecentSong = async (

): Promise<SongEntity | null> => {
    const percent = getRandomPercent();

    let songEntity: SongEntity | null = null;
    if (percent < 85) {
        songEntity = await getLrsTopListens();
    } else {
        songEntity = await getLrsLowerListens();
    }

    return songEntity;
}


export const getRandomPercent = (): number => {
    const percent = Math.floor(Math.random() * 100);
    return percent;
}


const getLrsTopListens = async (

): Promise<SongEntity | null> => {
    try {
        const rowsTopListens = await flowDb
            .select()
            .from(songsTable)
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

): Promise<SongEntity | null> => {

    const lowerListensPoolSize = await getLowerListensPoolSize();

    try {
        const rowsLowerListens = await flowDb
            .select()
            .from(songsTable)
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