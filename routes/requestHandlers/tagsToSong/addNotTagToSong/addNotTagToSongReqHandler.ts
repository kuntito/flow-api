import { Request, Response, RequestHandler } from "express";
import { doesSongExist, doesSongTagExist } from "../helpers";
import { SongNotTagEntity } from "../../../../schema/songNotTag-schema";
import { addNotTagToSongInDb } from "./addNotTagToSongHelpers";

export type AddNotTagToSongResponse =
    | {
        success: true;
    }
    | {
        success: false;
        clientErrorMessage?: string;
        debug?: object;
    }


const addNotTagToSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<AddNotTagToSongResponse>
) => {
    const songIdStr = req.params.songIdStr;
    const songId = parseInt(songIdStr as string);

    if (isNaN(songId)) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: "song id should be a number"
                }
            });
    }


    const tagId = parseInt(req.body.tagId);
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


    const isTagExist = await doesSongTagExist(tagId);
    if (!isTagExist) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: `song tag, '${tagId}, does not exist`
                }
            });
    }

    
    const isSongExist = await doesSongExist(songId);
    if (!isSongExist) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: `song id, ${songId}, does not exist`
                }
            });
    }


    const songNotTagEntity: SongNotTagEntity = {
        songId: songId,
        tagId: tagId,
    }

    const isTagAddedSuccess = await addNotTagToSongInDb(songNotTagEntity);
    if (isTagAddedSuccess) {
        return res
            .status(201)
            .json({
                success: true,
            });
    } else {
        return res
            .status(500)
            .json({
                success: false,
                clientErrorMessage: "couldn't add not-tag to song"
            });
    }
}

export { addNotTagToSongReqHandler };