import { Request, RequestHandler, Response } from "express";
import { SongWithUrl } from "../../types/SongWithUrl";
import { prepareSongForClient } from "../../../helpers/miscHelpers";
import { moodGetLeastRecentSong } from "./getMoodNextSongHelpers";

type GetMoodNextSongResponse = {
    success: true;
    songWithUrl: SongWithUrl;
} | {
    success: false;
    debug: object;
}

/**
 * gets the least recently heard for this mood.
 * 
 * each mood is based on a song tag.
 */
const getMoodNextSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<GetMoodNextSongResponse>,
) => {
    const { tagIdStr } = req.params;

    const tagId = parseInt(tagIdStr as string);

    if (isNaN(tagId)) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: "tag id should be a number"
                }
            });
    }


    // tells the client not to cache the response, some browsers do.
    res.setHeader('Cache-Control', 'no-store');

    const songEntity = await moodGetLeastRecentSong(tagId);
    if (songEntity == null) {
        return res
            .status(404)
            .json({
                success: false,
                debug: {
                    message: "no songs found for this mood"
                }
            });
    }

    const songWithUrl: SongWithUrl = await prepareSongForClient(
        songEntity
    );

    return res
        .status(200)
        .json({
            success: true,
            songWithUrl: songWithUrl
        });
}

export { getMoodNextSongReqHandler };