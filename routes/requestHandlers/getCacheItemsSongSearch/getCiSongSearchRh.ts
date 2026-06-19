import { Request, RequestHandler, Response } from "express";
import { getCacheItemsSongSearch } from "./getCiSongSearchHelpers";
import { SongSearchItem } from "../../types/SongSearchItem";

type GetCiSongSearchResponse = {
    success: true;
    itemCount: number;
    cacheItems: SongSearchItem[];
} | {
    success: false;
    debug: object;
}

const getCiSongSearchRh: RequestHandler = async (
    req: Request,
    res: Response<GetCiSongSearchResponse>
) => {
    const cacheItems = await getCacheItemsSongSearch();

    if (cacheItems == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't get cache items for song search"
                },
            })
    } else {
        return res
            .status(200)
            .json({
                success: true,
                itemCount: cacheItems.length,
                cacheItems: cacheItems,
            });
    }
}

export { getCiSongSearchRh };