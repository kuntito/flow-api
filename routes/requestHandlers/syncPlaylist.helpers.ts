import { inArray } from "drizzle-orm";
import { flowDb } from "../../clients/neonDbClient";
import { playlistsTable } from "../../schema/playlist-schema";
import { ValidationResult } from "../../util/validation";
import { isValidId, removeExtraSpaces } from "../helpers";
import { ResponsePlaylist, SyncPlaylistItem, SyncPlaylistsInput } from "./syncPlaylists.types";
import { songsTable } from "../../schema/song-schema";
import { playlistSongsTable } from "../../schema/playlistSongs-schema";
import { logDbError } from "../../helpers/dbHelpers";
import { Transaction } from "../../util/types";

type PlaylistItem = {
    playlistId: number;
    name: string;
    isAuto: boolean;
}

type PlaylistAndSong = {
    playlistId: number;
    songId: number;
}


export const validateInputSyncPlaylists = (
    playlists: any,
): ValidationResult<SyncPlaylistsInput> => {
    if (!Array.isArray(playlists)) {
        return {
            isValid: false,
            reason: "playlists must be a list",
        };
    }

    const validatedPlaylists = new Map<number, SyncPlaylistItem>();
    const seenPlaylistNames = new Set<string>();

    for (let i = 0; i < playlists.length; i++) {
        const p = playlists[i];
        const label = `playlist ${i + 1}`;

        if (!isValidId(p?.playlistId)) {
            return {
                isValid: false,
                reason: `${label}: playlist id must be a whole number above zero, it is ${p?.playlistId}`,
            };
        }

        if (validatedPlaylists.has(p.playlistId)) {
            return {
                isValid: false,
                reason: `${label} has duplicate playlist id, ${p.playlistId}`,
            };
        }

        if (typeof p.name !== "string" || !p.name.trim()) {
            return {
                isValid: false,
                reason: `${label}, playlist ${p.playlistId} doesn't have a name`,
            };
        }

        const playlistName = removeExtraSpaces(p.name);

        if (seenPlaylistNames.has(playlistName)) {
            return {
                isValid: false,
                reason: `${label} has duplicate name, ${playlistName}`,
            };
        }
        seenPlaylistNames.add(playlistName);

        if (typeof p.isAuto !== "boolean") {
            return {
                isValid: false,
                reason: `${label}, playlist ${p.playlistId}: is auto must be true or false, it is ${p.isAuto}`,
            };
        }

        if (!Array.isArray(p.songIds)) {
            return {
                isValid: false,
                reason: `${label}, playlist ${p.playlistId}: song ids must be a list`,
            };
        }

        const songIds = new Set<number>();
        for (let j = 0; j < p.songIds.length; j++) {
            const songId = p.songIds[j];

            if (!isValidId(songId)) {
                return {
                    isValid: false,
                    reason: `${label}, song ${j + 1}: song id must be a whole number above zero, it is ${songId}`,
                };
            }

            songIds.add(songId);
        }

        validatedPlaylists.set(p.playlistId, {
            playlistId: p.playlistId,
            name: playlistName,
            songIds: Array.from(songIds),
            isAuto: p.isAuto,
        });
    }

    return {
        isValid: true,
        data: {
            playlists: Array.from(validatedPlaylists.values()),
        },
    };
}


/**
 * the same playlists, keeping only songs the server has.
 *
 * mobile can hold songs the server doesn't have,
 * and those would break the insert.
 * 
 * server is truth.
 */
const dropUnknownSongs = async (
    tx: Transaction,
    playlists: SyncPlaylistItem[],
): Promise<SyncPlaylistItem[]> => {
    const sentSongIds = playlists.flatMap((playlist) => {
        return playlist.songIds;
    });

    if (sentSongIds.length === 0) {
        return playlists;
    }

    const existingSongRows = await tx
        .select({
            songId: songsTable.songId,
        })
        .from(songsTable)
        .where(
            inArray(
                songsTable.songId,
                sentSongIds,
            )
        );

    const existingSongIds = new Set(
        existingSongRows.map((row) => {
            return row.songId;
        })
    );

    const playlistsWithKnownSongs = playlists.map((playlist) => {
        const knownSongIds = playlist.songIds.filter((songId) => {
            return existingSongIds.has(songId);
        });

        return {
            ...playlist,
            songIds: knownSongIds,
        };
    });

    return playlistsWithKnownSongs;
}


/**
 * adds each playlist's songs.
 *
 * expects the playlists to exist,
 * and every song id to be one the server has.
 *
 * see `dropUnknownSongs`.
 */
const insertPlaylistSongs = async (
    tx: Transaction,
    playlists: SyncPlaylistItem[],
) => {
    const playlistSongsToInsert: PlaylistAndSong[] = playlists.flatMap((playlist) => {
        return playlist.songIds.map((songId) => {
            return {
                playlistId: playlist.playlistId,
                songId: songId,
            };
        });
    });

    if (playlistSongsToInsert.length > 0) {
        await tx
            .insert(playlistSongsTable)
            .values(playlistSongsToInsert);
    }
}

/**
 * deletes the existing playlists and replaces them with the new playlists.
 *
 * deleting a playlist cascades to its songs,
 * so their songs are re-added after.
 */
const replacePlaylists = async (
    tx: Transaction,
    playlists: SyncPlaylistItem[],
) => {
    await tx.delete(playlistsTable);

    const playlistsToInsert = playlists.map((playlist) => {
        return {
            playlistId: playlist.playlistId,
            playlistName: playlist.name,
            isAuto: playlist.isAuto,
        };
    });

    await tx
        .insert(playlistsTable)
        .values(playlistsToInsert);

    const playlistsWithKnownSongs = await dropUnknownSongs(
        tx,
        playlists,
    );

    await insertPlaylistSongs(
        tx,
        playlistsWithKnownSongs,
    );
}


const buildResponsePlaylists = (
    playlistRows: PlaylistItem[],
    playlistSongRows: PlaylistAndSong[],
): ResponsePlaylist[] => {
    const songIdsByPlaylistId = new Map<number, number[]>();

    for (const row of playlistSongRows) {
        const songIds = songIdsByPlaylistId.get(row.playlistId) ?? [];
        songIds.push(row.songId);

        songIdsByPlaylistId.set(
            row.playlistId,
            songIds,
        );
    }

    const playlists = playlistRows.map((row) => {
        return {
            playlistId: row.playlistId,
            name: row.name,
            songIds: songIdsByPlaylistId.get(row.playlistId) ?? [],
            isAuto: row.isAuto,
        };
    });

    return playlists;
}


const getAllPlaylists = async (
    tx: Transaction,
): Promise<ResponsePlaylist[]> => {
    
    const playlistsQuery = tx
        .select({
            playlistId: playlistsTable.playlistId,
            name: playlistsTable.playlistName,
            isAuto: playlistsTable.isAuto,
        })
        .from(playlistsTable);

    const playlistSongsQuery = tx
        .select({
            playlistId: playlistSongsTable.playlistId,
            songId: playlistSongsTable.songId,
        })
        .from(playlistSongsTable);

    const [
        rowsPlaylist,
        rowsPlaylistSong,
    ] = await Promise.all([
        playlistsQuery,
        playlistSongsQuery,
    ]);

    const responsePlaylists = buildResponsePlaylists(
        rowsPlaylist,
        rowsPlaylistSong,
    );

    return responsePlaylists;
}

/**
 * playlists are created on the mobile client.
 *
 * mobile sends its data, and the server
 * treats this as truth.
 *
 * it wipes and replaces its own data
 * with mobile's.
 *
 * songs the server no longer has are left out,
 * the rest of the playlist still syncs.
 *
 * if mobile sends an empty list,
 * it simply returns the existing playlist data.
 *
 * nothing gets wiped.
 */
export const syncPlaylists = async (
    playlists: SyncPlaylistItem[],
): Promise<ResponsePlaylist[] | null> => {
    try {
        return await flowDb.transaction(
            async (tx) => {
                const isMobileSentEmpty = playlists.length === 0;

                if (isMobileSentEmpty) {
                    // intentionally blank, reads better
                } else {
                    await replacePlaylists(
                        tx,
                        playlists,
                    );
                }

                const allPlaylists = await getAllPlaylists(tx);

                return allPlaylists;
            }
        );

    } catch (e) {
        logDbError(
            "couldn't sync playlists",
            e
        );
    }

    return null;
}