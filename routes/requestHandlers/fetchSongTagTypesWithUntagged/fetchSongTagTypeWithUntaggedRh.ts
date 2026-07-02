import { RequestHandler, Request, Response } from "express";
import { SongTagType } from "../../types/SongTagType";
import { fetchSongTagsWithUntaggedSongs } from "./songTagsUntaggedSongsHelpers";

type FetchSongTagsWithUntaggedSongsResponse = {
    success: true;
    tagCount: number,
    songTagTypes: SongTagType[]
} | {
    success: false;
    debug: object;
}

const fetchSongTagsWithUntaggedSongsRh: RequestHandler = async (
    req: Request,
    res: Response<FetchSongTagsWithUntaggedSongsResponse>
) => {
    const maybeSongTagTypes = await fetchSongTagsWithUntaggedSongs();

    if (maybeSongTagTypes) {
        return res
            .status(200)
            .json({
                success: true,
                tagCount: maybeSongTagTypes.length,
                songTagTypes: maybeSongTagTypes
            })
    } else {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    message: "couldn't fetch tags from db"
                }
            })
    }
}

export { fetchSongTagsWithUntaggedSongsRh };