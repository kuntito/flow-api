import { Request, RequestHandler, Response } from "express";
import { getIdNextSong } from "./getNextSongHelpers";
import { getSignedObjectUrlS3 as getSignedUrlS3 } from "../../../helpers/s3Helpers";
import { safeGetSongFromDb } from "../../../helpers/songDbHelpers";
import { SongWithUrl, toSongWithUrl } from "../types";


type GetNextSongResponse = {
    success: true;
    songWithUrl: SongWithUrl;
} | {
    success: false;
    debug: object;
}

// TODO getNextSong should be based on recency.
// always get the least recently played song.
/**
 * fetches the next song in the queue.
 */
const getNextSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<GetNextSongResponse>,
) => {
    const idNextSong = await getIdNextSong();
    if (idNextSong == null) {
        return res.status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't get id of next song"
                }
            })
    }

    
    // fetch song from db..
    const songEntity = await safeGetSongFromDb(idNextSong);
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
    
    const songUrl = await getSignedUrlS3(songEntity.songS3Key);

    const songWithUrl: SongWithUrl = toSongWithUrl(
        songEntity,
        songUrl,
    );

    return res
        .status(200)
        .json({
            success: true,
            songWithUrl: songWithUrl,
        });
}

export { getNextSongReqHandler };