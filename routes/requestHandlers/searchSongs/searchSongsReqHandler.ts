import { RequestHandler } from "express";
import { validateSearchQuery } from "../../../helpers/miscHelpers";
import { SongEntity } from "../../../schema/song-schema";
import { getAllSongs, searchDbForSongs } from "./searchSongsHelpers";
import { SongSearchItem } from "../../types/SongSearchItem";

const toSongSearchItem = (
    songEntity: SongEntity
): SongSearchItem => ({
    id: songEntity.songId,
    title: songEntity.songTitle,
    artistStr: songEntity.songArtistName,
    albumArtUrl: songEntity.songAlbumArtUrl,
})


type SearchSongsResponse = {
    success: true;
    itemCount: number;
    searchResults: SongSearchItem[];
} | {
    success: false;
    debug: object;
}

const searchSongsReqHandler: RequestHandler<
    {},
    SearchSongsResponse,
    {},
    { q: string }
>= async (req, res) => {

    const rawQuery = req.query.q;
    const validateRes = validateSearchQuery(rawQuery);

    if (!validateRes.success) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    message: validateRes.reason
                }
            });
    }

    const searchQuery = validateRes.validatedQuery;

    const songSearchResults = await searchDbForSongs(searchQuery);


    if (songSearchResults == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "db search for song failed"
                }
            })
    }
    
    const songSearchItems = songSearchResults.map(toSongSearchItem);

    return res
        .status(200)
        .json({
            success: true,
            itemCount: songSearchResults.length,
            searchResults: songSearchItems,
        })

}

export { searchSongsReqHandler };