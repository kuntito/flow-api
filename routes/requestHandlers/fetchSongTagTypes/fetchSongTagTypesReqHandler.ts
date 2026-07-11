import { RequestHandler, Request, Response } from "express";
import { SongTagType } from "../../types/SongTagType";
import { fetchAllSongTags, fetchAllSongTagsWithWork } from "./fetchSongTagTypesHelper";

export type SongTagTypeWithWork = SongTagType & {
    hasUnaddressed: boolean;
};

type FetchSongTagTypesResponse = {
    success: true;
    tagCount: number,
    songTagTypes: SongTagTypeWithWork[]
} | {
    success: false;
    debug: object;
}

const fetchSongTagTypesReqHandler: RequestHandler = async (
    req: Request,
    res: Response<FetchSongTagTypesResponse>
) => {
    const maybeSongTagTypes = await fetchAllSongTagsWithWork();

    if (maybeSongTagTypes) {
        return res
            .status(200)
            .json({
                success: true,
                tagCount: maybeSongTagTypes.length,
                songTagTypes: maybeSongTagTypes
            })
    } else {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    message: "couldn't fetch tags from db"
                }
            })
    }
}

export { fetchSongTagTypesReqHandler };