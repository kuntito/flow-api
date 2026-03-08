import { eq, sql } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { nextSongTable, nextSongTN } from "../../../schema/nextSong-schema";
import { PgTransaction, PgTableWithColumns } from "drizzle-orm/pg-core";
import { songQueueTable } from "../../../schema/songQueue-schema";
import { songsTable } from "../../../schema/song-schema";
import { shuffleArray } from "../../../helpers/miscHelpers";
import { gt, getTableName } from "drizzle-orm";
import { logDbError } from "../../../helpers/dbHelpers";


/**
 * all songs are part of the song queue.
 * 
 * the table, `nextSong`, holds the position of the next song in queue.
 * this value is fetched and used to query the song queue for the specific song.
 * 
 * once, the next song is fetched.
 * the `nextSong` table updates it's queue position.
 * 
 * if anything fails, return null.
 */
export const getIdNextSong = async (): Promise<number | null> => {
    try {
        return await flowDb.transaction(async (dbTransaction) => {
    
            // passing the string `nextSongTN` alone makes sql think 
            // it's a query parameter instead of a table name
            const acceptableNextSongTN = sql.identifier(nextSongTN);
    
            // locks the `nextSongTable`
            // this way, every new request has to wait for ongoing requests to finish. 
            await dbTransaction.execute(
                sql`LOCK TABLE ${acceptableNextSongTN} IN EXCLUSIVE MODE`
            );

    
            // fetching queue position for next song
            const nextSongQueuePos = await resolvePositionInQueue(dbTransaction);
            if (nextSongQueuePos == null) return null;
        
            // fetching song using queue position
            const resultRows = await dbTransaction
                .select({ songId: songQueueTable.songId })
                .from(songQueueTable)
                .where(eq(songQueueTable.pos, nextSongQueuePos))
                .limit(1);
    
            const songId = resultRows[0]?.songId;
            if (songId === undefined) {
                return null;
            }
        
            // update the queue position for next song
            await updateQueuePositionNextSong(dbTransaction, nextSongQueuePos);
    
            return songId;
        })
    } catch (e) {
        logDbError(
            "couldn't get id of next song",
            e
        );

        return null;
    }
}


/**
 * returns the position of the next song in the queue.
 * 
 * if anything goes wrong, returns null.
 */
const resolvePositionInQueue = async (
    dbTransaction: PgTransaction<any, any, any>,
): Promise<number | null> => {
    let pos: number | null = null;

    const isEmpty = await isDbTableEmpty(dbTransaction, nextSongTable);
    if (isEmpty == null) return null;

    if (isEmpty) {
        pos = await initializeNextSongTable(dbTransaction);
    } else {
        pos = await fetchNextSongQueuePosition(dbTransaction);
    }

    return pos;
}

/**
 * returns `null` if something goes wrong. 
 */
const isDbTableEmpty = async (
    dbTransaction: PgTransaction<any, any, any>,
    table: PgTableWithColumns<any>,
): Promise<boolean | null> => {
    try {
        const res = await dbTransaction
            .select()
            .from(table)
            .limit(1);

        return res.length === 0;
    } catch (e) {
        logDbError(
            "could not run `isDbTableEmpty` for table: " +
            getTableName(table),
            e
        );
        
        return null;
    }
}

/**
 * grabs the position of the first song in the queue.
 * 
 * if queue is empty, triggers queue population.
 * 
 * returns `null` if something goes wrong.
 */
const getFirstQueuePos = async (
    dbTransaction: PgTransaction<any, any, any>,
): Promise<number | null> => {
    try {
        const isEmpty = await isDbTableEmpty(dbTransaction, songQueueTable);
        if (isEmpty == null) return null;

        if (isEmpty) {
            const isPopulated = await populateSongQueue(dbTransaction);
            if (!isPopulated) return null;
        }

        const resultRows = await dbTransaction
            .select({ pos: songQueueTable.pos })
            .from(songQueueTable)
            .orderBy(songQueueTable.pos)
            .limit(1);

        const firstQueuePos = resultRows[0]?.pos

        return firstQueuePos ?? null;
    } catch(e) {
        logDbError(
            "couldn't fetch first position from song queue",
            e
        )

        return null;
    }
}

/**
 * `nextSongTable` holds the queue position for the next song.
 * it's a singleton table, one row, one column.
 * 
 * it's initialized with the first position from the song queue. 
 * 
 * returns that position, or `null` if anything fails.
 */
const initializeNextSongTable = async (
    dbTransaction: PgTransaction<any, any, any>
): Promise<number | null> => {

    try {
        const firstQueuePos = await getFirstQueuePos(dbTransaction);
        if (firstQueuePos === null) return null;

        await dbTransaction
            .insert(nextSongTable)
            .values({
                posInQueue: firstQueuePos
            })

        return firstQueuePos;
    } catch (e) {
        logDbError(
            "couldn't populate next song table",
            e
        );

        return null
    }
}

/**
 * the song queue is shuffled copy of the songs in the song table.
 * each song is assigned an auto-incrementing queue position.
 * 
 * fn clears the existing queue and repopulates it with a fresh shuffle.
 * 
 * returns `false` if anything fails.
 */
const populateSongQueue = async (
    dbTransaction: PgTransaction<any, any, any>,
): Promise<boolean> => {
    try {
        // grab all the song ids from song table..
        const songs = await dbTransaction
            .select({ songId: songsTable.songId})
            .from(songsTable);

        if (songs.length === 0) return false;

        // shuffle them..
        shuffleArray(songs);

        // empty songQueue just in case.
        await dbTransaction.delete(songQueueTable);

        // insert all the song ids into the queue
        await dbTransaction
            .insert(songQueueTable)
            .values(songs.map(s => ({
                songId: s.songId
            })))

        return true;
    
    } catch(e) {
        logDbError(
            "couldn't populate song queue",
            e
        )

        return false;
    }
}

/**
 * the queue position for the next song is stored in the `nextSongTable`.
 * 
 * the table is a singleton, one row, one column.
 * 
 * fn returns the queue position or `null` if anything fails.
 */
const fetchNextSongQueuePosition = async(
    dbTransaction: PgTransaction<any, any, any>,
): Promise<number | null> => {
    try {
        const resultRows = await dbTransaction
            .select({
                posInQueue: nextSongTable.posInQueue
            })
            .from(nextSongTable)
            .limit(1);
    
        const nextSongPosInQueue = resultRows[0]?.posInQueue;
    
        return nextSongPosInQueue ?? null;
    } catch (e) {
        logDbError(
            "couldn't fetch from `nextSongTable`",
            e
        );

        return null;
    }
}

// all positions in songQueueTable are auto-incrementing integers.
const PRE_QUEUE_POS = -1;
/**
 * the queue position for the next song is stored in `nextSongTable`.
 * 
 * `nextSongTable` is a singleton. one row, one column.
 * 
 * this fn is typically called, when it's value has been consumed.
 * at which point, it's value should point to the next song in the queue.
 * 
 * the songQueue table is queried for the queue position greater than the current one.
 * if there's none, we're probably at the end of the queue.
 * 
 * it refreshes the queue and grabs the first position.
 */
const updateQueuePositionNextSong = async (
    dbTransaction: PgTransaction<any, any, any>,
    curPos: number,
    hasTriedPopulatingQueue: boolean = false,
): Promise<boolean> => {
    try {
        const resultRows = await dbTransaction
            .select({ pos: songQueueTable.pos })
            .from(songQueueTable)
            .where(gt(songQueueTable.pos, curPos))
            .orderBy(songQueueTable.pos)
            .limit(1);
    
        const nextPos = resultRows[0]?.pos;

        // if this is true, chances are, it's the end of the queue
        if (nextPos === undefined) {
            // empty the nextSong singleton, it references `songQueueTable`
            await dbTransaction.delete(nextSongTable);

            if (hasTriedPopulatingQueue) return false;
    
            const isPopulated = await populateSongQueue(dbTransaction);
            if (!isPopulated) return false;
    
            // repeat call after refreshing queue
            return await updateQueuePositionNextSong(
                dbTransaction,
                PRE_QUEUE_POS,
                true
            );
        }
    
        await dbTransaction
            .update(nextSongTable)
            .set({
                posInQueue: nextPos
            });
    
        return true;
    } catch (e) {
        logDbError(
            "couldn't update next song table",
            e
        )

        return false;
    }
}

