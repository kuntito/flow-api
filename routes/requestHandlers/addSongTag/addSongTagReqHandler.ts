import { Request, Response, RequestHandler } from "express";
import { SongTagEntity } from "../../../schema/songTagTypes-schema";
import { addSongTagToDb, validateTagDescription, validateTagName } from "./addSongTagHelpers";

type AddSongTagResponse = 
    | {
        success: true;
    }
    | {
        success: false;
        clientErrorMessage?: string;
        debug?: object;
    };

/**
 * adds a new song tag.
 * 
 * validates against duplicate tags and trailing whitespace.
 */
const addSongTagReqHandler: RequestHandler = async (
    req: Request,
    res: Response<AddSongTagResponse>
) => {
    const {
        tagName,
        tagDescription
    } = req.body;

    const tagNameValidationRes = validateTagName(tagName);
    if (!tagNameValidationRes.isValid) {
        return res
            .status(400)
            .json({
                success: false,
                clientErrorMessage: tagNameValidationRes.errorMessage,
            });
    }

    const tagDescriptionValidationRes = validateTagDescription(tagDescription);
    if (!tagDescriptionValidationRes.isValid) {
        return res
            .status(400)
            .json({
                success: false,
                clientErrorMessage: tagDescriptionValidationRes.errorMessage
            });
    };

    const songTagEntity: SongTagEntity = {
        tagName: tagNameValidationRes.validatedTagName,
        tagDescription: tagDescriptionValidationRes.validatedTagDescription,
    };

    const songTagAddRes = await addSongTagToDb(songTagEntity);
    if(songTagAddRes.success) {
        return res
            .status(songTagAddRes.statusCode)
            .json({
                success: true
            })
    } else {
        return res
            .status(songTagAddRes.statusCode)
            .json({
                success: false,
                clientErrorMessage: songTagAddRes.reason,
                debug: {
                    errorMessage: "db insert for song tag failed"
                }
            })
    };
}

export { addSongTagReqHandler };