import { eq, notInArray } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { SongTagEntity, songTagTypesTable } from "../../../schema/songTagTypes-schema";
import { SongForTagging } from "./getSongsForTaggingRH";
import { SongEntity, songsTable } from "../../../schema/song-schema";
import { songTagMatchTable } from "../../../schema/songTagMatch-schema";


export const getTag = async(
    tagId: number,
): Promise<SongTagEntity | null> => {
    try {
        const rows = await flowDb
            .select()
            .from(songTagTypesTable)
            .where(eq(songTagTypesTable.tagId, tagId));

        return rows[0] ?? null
    } catch (e) {
        logDbError(
            `couldn't fetch tag with ${tagId}`,
            e
        )
    }

    return null;
}


/**
 * songs that have been tagged with this `tagId`
 */
const getTaggedSongIds = async (
    tagId: number
): Promise<number[] | null> => {
    try {
        const rows = await flowDb
            .select({ 
                songId: songTagMatchTable.songId 
            })
            .from(songTagMatchTable)
            .where(
                eq(
                    songTagMatchTable.tagId,
                    tagId
                )
            );

        return rows.map(r => r.songId);
    } catch (e) {
        logDbError(
            `couldn't fetch tagged song ids for tagId=${tagId}`,
            e
        );
    }
    return null;
};


/**
 * returns songs that haven't been tagged with `tag`
 * 
 * songs are classed as tagged,
 * if they have an entry in `SongTagMatchTable`
 */
export const getSongsForTagging = async (
    tag: SongTagEntity,
    batchSize: number,
): Promise<SongEntity[] | null> => {
    try {
        const idsTaggedSongs = await getTaggedSongIds(tag.tagId);
        if (idsTaggedSongs == null) return null;

        const rows = await flowDb
            .select()
            .from(songsTable)
            .where(
                idsTaggedSongs.length > 0
                    ? notInArray(
                        songsTable.songId,
                        idsTaggedSongs
                    )
                    : undefined
            )
            .limit(batchSize);

        return rows;
    } catch(e) {
        logDbError(
            `couldn't get songs for tagging, tag=${tag.tagName}`,
            e
        )
    }

    return null;
}


export const toSongForTagging = (
    songEntity: SongEntity
): SongForTagging => ({
    songId: songEntity.songId,
    songTitle: songEntity.songTitle,
    artistStr: songEntity.songArtistName,
    albumArtUrl: songEntity.songAlbumArtUrl,
});