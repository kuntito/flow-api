import { flowDb } from "../clients/neonDbClient";
import { SongEntity, songsTable } from "../schema/song-schema";
import { eq, ilike } from "drizzle-orm";
import { songListenCountTable } from "../schema/songListenCount-schema";

// the system is designed to track listens
// i'm designing the API so the next song function
// considers listen count


// however, my listen history predates `flow`
// and so, i'm initializing the listen counts for select songs.

// i extracted them from iTunes and Black player.
// iTunes is my Desktop player, and Black player, mobile.

type SongListenEntry = {
    songTitle: string;
    listenCount: number
}

const initEntries: SongListenEntry[] = [
    {
        songTitle: "Again",
        listenCount: 294,
    },
    {
        songTitle: "Without Me",
        listenCount: 258,
    },
    {
        songTitle: "StarBoy",
        listenCount: 200,
    },
    {
        songTitle: "you gon' learn",
        listenCount: 127,
    },
    {
        songTitle: "Airplanes � What's my name (Cover)",
        listenCount: 68,
    },
    {
        songTitle: "Holy Key",
        listenCount: 55,
    },
    {
        songTitle: "Hold Me While It's Ending",
        listenCount: 52,
    },
    {
        songTitle: "Gucci Gang (Joyner Lucas Remix)",
        listenCount: 49,
    }
]

// so, what's the plan
// search db based on song title
// if there's a single row result
// update it's listen count accordingly...



const initializeListenCounts = async () => {
    const skippedEntries = [];

    for (const entry of initEntries) {
        // find song by title
        const matchingRows = await flowDb
            .select()
            .from(songsTable)
            .where(
                ilike(
                    songsTable.songTitle,
                    entry.songTitle
                )
            );

        // only proceed if exactly one match
        if (matchingRows.length === 1) {            
            const song = matchingRows[0];
            
            const isInitializedListen = await updateListenCount(
                song,
                entry
            );
            
            if (isInitializedListen) {
                console.log(`set "${entry.songTitle}" to ${entry.listenCount}`);
            } else {                
                skippedEntries.push(
                    entry
                );
            }
    
        } else {
            skippedEntries.push(
                entry
            );
        }
    }

    
    if (skippedEntries.length > 0) {
        console.log('the following entries were skipped.');
        console.log("\n");
    }

    for (const entry of skippedEntries) { 
        console.log(
            JSON.stringify(entry) + ','
        );
    }
};


const updateListenCount = async (
    song: SongEntity,
    listenEntry: SongListenEntry,
): Promise<boolean> => {
    try {        
        await flowDb
            .insert(songListenCountTable)
            .values({
                songId: song.songId,
                listenCount: listenEntry.listenCount,
            })
            .onConflictDoUpdate({
                target: songListenCountTable.songId,
                set: { 
                    listenCount: listenEntry.listenCount
                },
            });
    } catch(e) {
        return false;
    }

    return true;
}


initializeListenCounts();