import { flowDb } from "../clients/neonDbClient";
import { songsTable } from "../schema/song-schema";
import * as readline from 'readline';

const BASE_DELETE_URL = "https://flow-api-o6gg.onrender.com/api/flow/song";

/**
 * removes all songs from the system.
 * console logs for any failed deletion.                                        *
 *
 * sample failure log:                                                       
 * 
 * song details: {songTitle} - {songArtistName}
 * status: {statusCode}
 * debug: {body.debug}
 */
const nukeSongs = async () => {
    const isUserConfirmNuke = await confirmNukeSongs();
    if (!isUserConfirmNuke) {
        console.log('nuke aborted.');
        process.exit(0);
    }

    const allSongs = await flowDb.select({
        songId: songsTable.songId,
        songTitle: songsTable.songTitle,
        songArtistName: songsTable.songArtistName,
    }).from(songsTable);

    console.log(`found: ${allSongs.length} songs`);
    console.log('deleting...');

    for (const song of allSongs){
        const res = await fetch(
            `${BASE_DELETE_URL}/${song.songId}`,
            {
                method: "DELETE"
            }
        );

        const body = await res.json();
        if (!body.success){
            console.log(`song details: ${song.songTitle} - ${song.songArtistName}`);
            console.log(`status: ${res.status}`);
            console.log(`debug:`, body.debug);
            console.log();
        }

    }
    console.log('done.');
    process.exit(0);
}


const confirmNukeSongs = (): Promise<boolean> => {
    const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        readlineInterface.question(
            "delete all songs from system? y/n: ",
            (userResponse) => {
                readlineInterface.close();
                resolve(
                    userResponse.trim().toLowerCase() === "y"
                );
            }
        )
    })
}

nukeSongs();