import { RequestHandler, Request, Response } from "express";
import { toSongWithUrl } from "../../types/SongWithUrl";
import { SongWithUrl } from "../../types/SongWithUrl";
import { isSongIdValid } from "../../helpers";
import { safeGetSongFromDb } from "../../../helpers/songDbHelpers";
import { getSignedObjectUrlS3 } from "../../../helpers/s3Helpers";
import { prepareSongForClient } from "../../../helpers/miscHelpers";

type GetSongResponse = {
    success: true;
    songWithUrl: SongWithUrl
} | {
    success: false;
    debug: object;
}


/**
 * fetches song by id.
 * 
 * song id is passed as a query string.
 */
const getSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<GetSongResponse>
) => {

    const songIdStr = req.params.songIdStr;

    const isValid = isSongIdValid(songIdStr as string);
    if (!isValid) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: `songId should be a string, currently it is ${songIdStr}`
                }
            });
    }

    // at this point, `songId` has been validated 
    // and should be a number
    const songId = parseInt(songIdStr as string);

    // fetch song from db..
    const songEntity = await safeGetSongFromDb(songId);
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

    const songWithUrl: SongWithUrl = await prepareSongForClient(
        songEntity
    )

    return res
        .status(200)
        .json({
            success: true,
            songWithUrl: songWithUrl,
        });
}

export { getSongReqHandler };