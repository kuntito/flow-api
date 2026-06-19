import { flowDb } from "../../../clients/neonDbClient";
import { logDbError } from "../../../helpers/dbHelpers";
import { songsTable } from "../../../schema/song-schema";
import { SongSearchItem } from "../../types/SongSearchItem";

export const getCacheItemsSongSearch = async (

): Promise<SongSearchItem[] | null> => {
    try {
        const rows = await flowDb
            .select({
                id: songsTable.songId,
                title: songsTable.songTitle,
                artistStr: songsTable.songArtistName,
                albumArtUrl: songsTable.songAlbumArtUrl,
            })
            .from(songsTable);

        return rows;
    } catch (e) {
        logDbError(
            "couldn't get cache items for song search",
            e
        );
    }

    return null;
}