import { RequestHandler } from "express";
import { searchDbForSongs, validateSearchQuery } from "./searchSongsHelpers";
import { SongEntity } from "../../../schema/song-schema";

type SongSearchItem = {
    id: number;
    title: string;
    artistStr: string;
    albumArtUrl: string;
}

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
    console.log(searchQuery);
    
    const songSearchResults = (
        await searchDbForSongs(
            searchQuery
        )
    ).map(toSongSearchItem);

    return res
        .status(200)
        .json({
            success: true,
            itemCount: songSearchResults.length,
            searchResults: songSearchResults,
        })

}

export { searchSongsReqHandler };