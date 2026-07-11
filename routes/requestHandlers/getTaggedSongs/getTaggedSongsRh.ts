import { Request, RequestHandler, Response } from "express";
import { getSongTag } from "../../../helpers/songDbHelpers";
import { getTaggedSongs } from "./getTaggedSongsHelpers";

export type TaggedSong = {
    songId: number;
    songTitle: string;
    artistStr: string;
    albumArtUrl: string;
    isMatch: boolean;
}

type GetTaggedSongsResponse = 
    | {
        success: true;
        tagName: string;
        tagDescription: string;
        itemCount: number;
        items: TaggedSong[],
    }
    | {
        success: false;
        debug: object;
    };

    
const getTaggedSongsRh: RequestHandler = async (
    req: Request,
    res: Response<GetTaggedSongsResponse>
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

    const tag = await getSongTag(tagId);
    if (tag == null) {
        return res
            .status(404)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't get tag"
                }
            });
    }

    const taggedSongs = await getTaggedSongs(tag);
    if (taggedSongs == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't fetch tagged songs"
                }
            })
    }

    return res
        .status(200)
        .json({
            success: true,
            tagName: tag.tagName,
            tagDescription: tag.tagDescription,
            itemCount: taggedSongs.length,
            items: taggedSongs,
        })
}


export { getTaggedSongsRh };