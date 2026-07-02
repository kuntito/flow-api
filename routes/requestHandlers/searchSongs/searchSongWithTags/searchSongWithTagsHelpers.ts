import { and, eq, inArray } from "drizzle-orm";
import { flowDb } from "../../../../clients/neonDbClient";
import { logDbError } from "../../../../helpers/dbHelpers";
import { songTagTypesTable } from "../../../../schema/songTagTypes-schema";
import { searchDbForSongs } from "../searchSongsHelpers";
import { SongTag, SongWithTagsItem } from "./searchSongWithTagsReqHandler";
import { songTagMatchTable } from "../../../../schema/songTagMatch-schema";

/**
 * fetches songs based on query.
 * 
 * returns each song along with all it's positive tags.
 * 
 * song and tag pairs are stored in the same table.
 * 
 * a boolean indicates, 
 * positive association i.e. the song matches the tag.
 * negative association i.e. the song does not match the tag.
 */
export const searchDbSongWithTags = async (
    query: string,
): Promise<SongWithTagsItem[] | null> => {
    const maybeSongEntities = await searchDbForSongs(query);
    if (maybeSongEntities == null) {
        return null;
    }

    const songIds = maybeSongEntities.map(se => se.songId);
    const maybeRowsSongAndTag = await getRowsSongAndTag(songIds);

    if (maybeRowsSongAndTag == null) {
        return null
    }

    const songTagMap = buildSongTagMap(maybeRowsSongAndTag);

    const songWithTags: SongWithTagsItem[] = maybeSongEntities.map(s => ({
        id: s.songId,
        title: s.songTitle,
        artistStr: s.songArtistName,
        songTags: songTagMap.get(s.songId) ?? []
    }))

    return songWithTags;
}


type SongAndTag  = {
    songId: number
} & SongTag;


const getRowsSongAndTag = async (
    searchedSongIds: number[],
): Promise<SongAndTag[] | null> => {
    try {
        const rows = await flowDb
            .select({
                songId: songTagMatchTable.songId,
                tagId: songTagTypesTable.tagId,
                tagName: songTagTypesTable.tagName,
                tagDescription: songTagTypesTable.tagDescription,
            })
            .from(songTagMatchTable) // this allows me know what tags assigned to each song
            .innerJoin(
                songTagTypesTable,
                and(
                    eq(
                        songTagMatchTable.tagId,
                        songTagTypesTable.tagId
                    ),
                    eq(
                        songTagMatchTable.isMatch,
                        true
                    )
                )
            )
            .where(
                inArray(
                    songTagMatchTable.songId,
                    searchedSongIds,
                )
            )
        return rows;
    } catch (e) {
        logDbError(
            "couldn't fetch rows song and tag",
            e
        )
    }

    return null;
}

/**
 * pairs song id with an array of associated song tags.
 */
const buildSongTagMap = (
    songAndTag: SongAndTag[]
) => {
    const songTagMap = new Map<number, SongTag[]>();

    for (const sat of songAndTag) {
        const songId = sat.songId;

        let songTags = songTagMap.get(songId);
        if (songTags === undefined) {
            songTags = [];

            songTagMap.set(
                songId,
                songTags
            );
        }

        const tag: SongTag = {
            tagId: sat.tagId,
            tagName: sat.tagName,
            tagDescription: sat.tagDescription,
        }

        songTags.push(tag);
    }

    return songTagMap;
}