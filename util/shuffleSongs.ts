// flow's designed to return the least recently listened song

import { eq } from "drizzle-orm";
import { flowDb } from "../clients/neonDbClient";
import { songsTable } from "../schema/song-schema";
import { logDbError } from "../helpers/dbHelpers";

// unless, i interrupt flow by queuing up specific songs
// the playback queue would remain relatively the same.

// ideally, the more i use flow, the more random the playback queue becomes
// since, i have a habit of queueing up songs.

// however, as i've started using it, i've mostly let playback continue
// and the order of songs remains somewhat similar.

// this script does an artificial shuffle
// it only needs to be done once and it'd create a random order.

// further usage of the app, takes care of subsequents randomization.

const shuffleSongRecencies = async () => {
    try {
        // get all songs
        const allSongs = await flowDb
            .select({ songId: songsTable.songId })
            .from(songsTable);

        const totalCount = allSongs.length;
        const halfCount = Math.floor(totalCount / 2);

        // shuffle and take half
        const shuffled = allSongs.sort(() => Math.random() - 0.5);
        const songsToUpdate = shuffled.slice(0, halfCount);

        const now = Date.now();

        // update each with random recency
        for (const song of songsToUpdate) {
            const randomRecency = Math.floor(Math.random() * now);
            
            await flowDb
                .update(songsTable)
                .set({ recency: randomRecency })
                .where(eq(songsTable.songId, song.songId));
        }

        console.log(`updated ${halfCount} of ${totalCount} songs`);
    } catch (e) {
        logDbError('shuffle recencies failed', e);
    }
};

shuffleSongRecencies();