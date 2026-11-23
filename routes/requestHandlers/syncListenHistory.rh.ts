import { Request, Response } from "express";
import { SyncListenHistoryResponse } from "./syncListenHistory.types";
import { syncListenEvents, validateInputSyncListenHistory } from "./syncListenHistory.helpers";

export const syncListenHistoryRh = async (
    req: Request,
    res: Response<SyncListenHistoryResponse>
) => {
    const validationResult = validateInputSyncListenHistory(
        req.body
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

    const eventsAfter = await syncListenEvents(
        validationResult.data.events,
        validationResult.data.afterSeq
    );

    if (eventsAfter == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't sync listen events",
                },
            });
    }

    return res
        .status(200)
        .json({
            success: true,
            latestSeq: eventsAfter.latestSeq,
            itemCount: eventsAfter.events.length,
            events: eventsAfter.events,
        })
}