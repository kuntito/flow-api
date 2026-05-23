import { RequestHandler, Request, Response } from "express";
import { getSongsForTagging, getTag, toSongForTagging } from "./getSongsForTaggingHelpers";

export type SongForTagging = {
    songId: number;
    songTitle: string;
    artistStr: string;
    albumArtUrl: string;
}


type GetSongsForTaggingResponse = 
    | {
        success: true;
        tagName: string;
        tagDescription: string;
        itemCount: number;
        songsForTagging: SongForTagging[];
    }
    | {
        success: false;
        debug: object;
    }

const BATCH_SIZE = 16;
const getSongsForTaggingRH: RequestHandler = async (
    req: Request,
    res: Response<GetSongsForTaggingResponse>
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

    
    const maybeTag = await getTag(tagId);
    if (maybeTag == null) {
        return res
            .status(404)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't fetch tag"
                }
            })
    }

    const maybeSongsForTagging = await getSongsForTagging(
        maybeTag,
        BATCH_SIZE,
    );
    if (maybeSongsForTagging == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't fetch songs for tagging"
                }
            })
    }

    const songsForTagging = maybeSongsForTagging.map(toSongForTagging);

    return res
        .status(200)
        .json({
            success: true,
            tagName: maybeTag.tagName,
            tagDescription: maybeTag.tagDescription,
            itemCount: songsForTagging.length,
            songsForTagging: songsForTagging,
        });
}

export { getSongsForTaggingRH };