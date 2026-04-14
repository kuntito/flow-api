import { Request, RequestHandler, Response } from "express";
import { getLeastRecentSong } from "./getNextSongHelpers";
import { getSignedObjectUrlS3 } from "../../../helpers/s3Helpers";
import { safeGetSongFromDb } from "../../../helpers/songDbHelpers";
import { SongWithUrl, toSongWithUrl } from "../types";
import { prepareSongForClient } from "../../../helpers/miscHelpers";


type GetNextSongResponse = {
    success: true;
    songWithUrl: SongWithUrl;
} | {
    success: false;
    debug: object;
}


/**
 * next song is determined by recency.
 * 
 * fn returns the least recently accessed song.
 * recency is updated on every song fetch.
 */
const getNextSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<GetNextSongResponse>,
) => {
    // client side, sometimes, responses are cached.
    // it saves the API extra work.

    // however, it causes a problem with this route
    // since it's designed to return the least recently played song
    // on each call.

    // caching the result would not be the best practice.
    // so, this header tells the HTTP client, to not cache this route.
    res.setHeader('Cache-Control', 'no-store');

    // fetch song from db..
    const songEntity = await getLeastRecentSong();
    if (songEntity == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    message: "couldn't fetch song from db"
                }
            })
    }

    const songWithUrl: SongWithUrl = await prepareSongForClient(songEntity);

    return res
        .status(200)
        .json({
            success: true,
            songWithUrl: songWithUrl,
        });
}

export { getNextSongReqHandler };