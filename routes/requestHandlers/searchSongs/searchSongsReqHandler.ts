import { RequestHandler } from "express";
import { searchDbForSongs } from "./searchSongsHelpers";
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

    const query = req.query.q;
    if (query === undefined) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    message: "search query is undefined."
                }
            });
    }

    if (typeof query !== 'string') {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    message: "search query is not a string"
                }
            });
    }

    const songSearchResults = (
        await searchDbForSongs(query)
    ).map(toSongSearchItem);

    return res
        .status(200)
        .json({
            success: true,
            searchResults: songSearchResults,
        })

}

export { searchSongsReqHandler };