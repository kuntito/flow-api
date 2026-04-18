import { Request, Response, RequestHandler } from "express";
import { addTagToSongInDb, doesSongExist, doesSongTagExist } from "./addTagToSongHelpers";
import { SongAndTagEntity } from "../../../schema/songAndTag-schema";

type AddTagToSongResponse = 
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

    const { tagName } = req.body;


    const isTagExist = await doesSongTagExist(tagName);
    if (!isTagExist) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    errorMessage: `song tag, '${tagName}', does not exist`
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
        tagName: tagName,
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