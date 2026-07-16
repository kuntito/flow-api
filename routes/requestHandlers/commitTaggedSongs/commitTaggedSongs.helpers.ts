import { sql } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";

type TaggedSongInput = {
    songId: number;
    isMatch: boolean;
}

type TaggedSongsValidation =
    | { isValid: false; reason: string }
    | { isValid: true; songs: TaggedSongInput[] };


export const validateTaggedSongs = (
    body: any
): TaggedSongsValidation => {
    if (body == undefined) {
        return {
            isValid: false,
            reason: "request body is missing",
        };
    }

    const { songs } = body;

    if (!Array.isArray(songs)) {
        return {
            isValid: false,
            reason: "songs should be an array",
        };
    }

    if (songs.length === 0) {
        return {
            isValid: false,
            reason: "songs array is empty",
        };
    }

    for (const song of songs) {
        if (typeof song.songId !== "number" || isNaN(song.songId)) {
            return {
                isValid: false,
                reason: "each song needs a valid songId",
            };
        }

        if (typeof song.isMatch !== "boolean") {
            return {
                isValid: false,
                reason: `songId ${song.songId} needs an isMatch boolean`,
            };
        }
    }

    return {
        isValid: true,
        songs: songs.map((s: any) => ({
            songId: s.songId,
            isMatch: s.isMatch,
        })),
    };
}


export const commitTaggedSongs = async (
    tagId: number,
    songs: TaggedSongInput[]
): Promise<boolean> => {
    try {
        await flowDb
            .insert(songTagMatchTable)
            .values(
                songs.map(song => ({
                    songId: song.songId,
                    tagId: tagId,
                    isMatch: song.isMatch,
                }))
            )
            .onConflictDoUpdate({
                target: [
                    songTagMatchTable.songId,
                    songTagMatchTable.tagId
                ],
                set: {
                    isMatch: sql`excluded.is_match`,
                },
            });

        return true;
    } catch (e) {
        console.error("couldn't commit tagged songs:", e);
    }
    return false;
}