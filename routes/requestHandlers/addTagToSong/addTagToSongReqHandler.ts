import { Request, Response, RequestHandler } from "express";
import { addTagToSongInDb, doesSongExist, doesSongTagExist } from "./addTagToSongHelpers";
import { SongAndTagEntity } from "../../../schema/songAndTag-schema";

export type AddTagToSongResponse = 
    | {
        success: true
    }
    | {
        success: false;
        clientErrorMessage?: string;
        debug?: object;
    }


const addTagToSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<AddTagToSongResponse>
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
                    errorMessage: `song tag, '${tagId}', does not exist`
                }
            })
    }


    const isSongExist = await doesSongExist(songId);
    if (!isSongExist) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: `song id, '${songId}', does not exist`
                }
            });
    }


    const songAndTagEntity: SongAndTagEntity = {
        songId: songId,
        tagId: tagId,
    }
    const isTagAddedSuccess = await addTagToSongInDb(songAndTagEntity);

    if (isTagAddedSuccess) {
        return res
            .status(201)
            .json({
                success: true
            })
    } else {
        return res
            .status(500)
            .json({
                success: false,
                clientErrorMessage: "couldn't tag song"
            });
    }

}

export { addTagToSongReqHandler };