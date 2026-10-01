import { Request, Response } from "express";
import { SyncCiSongSearchResponse } from "./syncSongSearchCache.types";
import { getCacheItemsSongSearch } from "./getCacheItemsSongSearch/getCiSongSearchHelpers";
import { applyRecencies, validateInputSyncSongCache } from "./syncSongSearchCache.helpers";

export const syncCiSongSearchRh = async (
    req: Request,
    res: Response<SyncCiSongSearchResponse>
) => {
    const validationResult = validateInputSyncSongCache(
        req.body.recencyItems
    );
    if (!validationResult.isValid) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    reason: validationResult.reason,
                },
            });
    }

    const isRecencyApplied = await applyRecencies(
        validationResult.data.recencyItems
    );
    if (!isRecencyApplied) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    reason: "failed to apply recencies.",
                },
            });
    }


    const cacheItems = await getCacheItemsSongSearch();

    if (cacheItems == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't get cache items for song search"
                },
            });
    }

    return res
        .status(200)
        .json({
            success: true,
            itemCount: cacheItems.length,
            cacheItems: cacheItems,
        });
}