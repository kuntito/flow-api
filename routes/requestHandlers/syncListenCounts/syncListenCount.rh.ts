import { Request, RequestHandler, Response } from "express";
import { syncListenCounts, validateListenCounts } from "./syncListenCount.helpers";

type SyncListenCountsResponse =
    | {
        success: true;
    }
    | {
        success: false;
        clientMessage?: string;
        debug?: object;
    }

const syncListenCountsRh: RequestHandler = async (
    req: Request,
    res: Response<SyncListenCountsResponse>
) => {
    const validationRes = validateListenCounts(req.body);
    if (!validationRes.isValid) {
        return res
            .status(400)
            .json({
                success: false,
                clientMessage: validationRes.reason,
            });
    }

    const isSynced = await syncListenCounts(validationRes.items);
    if (!isSynced) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "failed to sync listen counts"
                }
            })
    }

    return res
        .status(200)
        .json({
            success: true,
        })
}

export { syncListenCountsRh };