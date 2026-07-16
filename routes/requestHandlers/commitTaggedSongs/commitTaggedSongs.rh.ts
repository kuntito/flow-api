import { Request, RequestHandler, Response } from "express";
import { commitTaggedSongs, validateTaggedSongs } from "./commitTaggedSongs.helpers";

type CommitTaggedSongsResponse = 
    | {
        success: true;
    }
    | {
        success: false;
        clientMessage?: string;
        debug: object;
    }

const commitTaggedSongsRh: RequestHandler = async (
    req: Request,
    res: Response<CommitTaggedSongsResponse>
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
            })
    }


    const validationRes = validateTaggedSongs(req.body);
    if (!validationRes.isValid) {
        return res
            .status(400)
            .json({
                success: false,
                clientMessage: validationRes.reason,
                debug: {
                    errorMessage: "tagged songs received is invalid.",
                }
            })
    }

    const isCommitted = await commitTaggedSongs(tagId, validationRes.songs);

    if (!isCommitted) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "failed to commit tagged songs"
                }
            })
    }

    return res
        .status(200)
        .json({
            success: true,
        })
}

export { commitTaggedSongsRh };