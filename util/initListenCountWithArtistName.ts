import { flowDb } from "../clients/neonDbClient";
import { SongEntity, songsTable } from "../schema/song-schema";
import { and, ilike } from "drizzle-orm";
import { songListenCountTable } from "../schema/songListenCount-schema";

// some songs have the same titles
// so to set the initial listen counts
// i have to specify the artist string too.


type SongWithArtistListenEntry = {
    songTitle: string;
    artistStr: string;
    listenCount: number;
}

const initEntries: SongWithArtistListenEntry[] = [
    {
        "songTitle":"Airplanes � What's my name (Cover)",
        "artistStr": "Nat Amanda",
        "listenCount":68
    },
]





const initializeListenCounts = async () => {
    const skippedEntries = [];

    for (const entry of initEntries) {
        // find song by title
        const matchingRows = await flowDb
            .select()
            .from(songsTable)
            .where(
                and(
                    ilike(songsTable.songTitle, entry.songTitle),
                    ilike(songsTable.songArtistName, entry.artistStr)
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
        console.log(entry);
    }

};


const updateListenCount = async (
    song: SongEntity,
    listenEntry: SongWithArtistListenEntry,
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