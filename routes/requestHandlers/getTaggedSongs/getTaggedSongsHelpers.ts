import { eq } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { songsTable } from "../../../schema/song-schema";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";
import { SongTagEntity } from "../../../schema/songTagTypes-schema";
import { TaggedSong } from "./getTaggedSongsRh";


export const getTaggedSongs = async (
    tag: SongTagEntity,
): Promise<TaggedSong[] | null> => {
    try {
        const rows = await flowDb
            .select({
                songId: songsTable.songId,
                songTitle: songsTable.songTitle,
                artistStr: songsTable.songArtistName,
                albumArtUrl: songsTable.songAlbumArtUrl,
                isMatch: songTagMatchTable.isMatch,
            })
            .from(songTagMatchTable)
            .innerJoin(
                songsTable,
                eq(
                    songTagMatchTable.songId,
                    songsTable.songId,
                )
            )
            .where(
                eq(
                    songTagMatchTable.tagId,
                    tag.tagId,
                )
            );

        return rows;
    } catch (e) {
        logDbError(
            `couldn't get tagged songs, ${tag.tagId}`,
            e
        );
    }
    return null;
}