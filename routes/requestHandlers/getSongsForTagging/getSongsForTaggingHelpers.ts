import { eq, notInArray } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { SongTagEntity, songTagTypesTable } from "../../../schema/songTagTypes-schema";
import { SongForTagging } from "./getSongsForTaggingRH";
import { songAndTagTable } from "../../../schema/songAndTag-schema";
import { songsNotTagTable } from "../../../schema/songNotTag-schema";
import { SongEntity, songsTable } from "../../../schema/song-schema";


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
            .select({ songId: songAndTagTable.songId })
            .from(songAndTagTable)
            .where(
                eq(
                    songAndTagTable.tagId,
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
 * songs that i've said don't fit this tag.
 */
const getNotTaggedSongIds = async (
    tagId: number
): Promise<number[] | null> => {
    try {
        const rows = await flowDb
            .select({ songId: songsNotTagTable.songId })
            .from(songsNotTagTable)
            .where(
                eq(
                    songsNotTagTable.tagId,
                    tagId
                )
            );

        return rows.map(r => r.songId);
    } catch (e) {
        logDbError(
            `couldn't fetch not-tagged song ids for tagId=${tagId}`,
            e
        );
    }

    return null;
};



export const getSongsForTagging = async (
    tag: SongTagEntity,
    batchSize: number,
): Promise<SongEntity[] | null> => {
    try {
        const songsAlreadyTagged = await getTaggedSongIds(tag.tagId);
        if (songsAlreadyTagged == null) return null;

        const songsNotMatchingTag = await getNotTaggedSongIds(tag.tagId);
        if (songsNotMatchingTag == null) return null;


        const songIdsNotForTagging = songsAlreadyTagged.concat(songsNotMatchingTag);

        const rows = await flowDb
            .select()
            .from(songsTable)
            .where(
                songIdsNotForTagging.length > 0
                    ? notInArray(
                        songsTable.songId,
                        songIdsNotForTagging
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