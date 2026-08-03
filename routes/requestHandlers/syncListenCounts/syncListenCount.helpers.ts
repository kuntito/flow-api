import { sql } from "drizzle-orm";
import { flowDb } from "../../../clients/neonDbClient";
import { songsTable } from "../../../schema/song-schema";

type ListenCountItem = {
    songId: number;
    listenCount: number;
}

type ListenCountsValidation =
    | { 
        isValid: false; 
        reason: string 
    }
    | {
        isValid: true;
        items: ListenCountItem[]
    };


export const validateListenCounts = (
    body: any
): ListenCountsValidation => {
    if (body == undefined) {
        return {
            isValid: false,
            reason: "request body is missing",
        };
    }

    const { itemsListenCount } = body;

    if (!Array.isArray(itemsListenCount)) {
        return {
            isValid: false,
            reason: "items should be an array",
        };
    }

    if (itemsListenCount.length === 0) {
        return {
            isValid: false,
            reason: "items array is empty",
        };
    }

    for (const item of itemsListenCount) {
        if (typeof item.songId !== "number" || isNaN(item.songId)) {
            return {
                isValid: false,
                reason: "each item needs a valid songId",
            };
        }

        if (typeof item.listenCount !== "number" || isNaN(item.listenCount) || item.listenCount < 0) {
            return {
                isValid: false,
                reason: `songId ${item.songId} needs a valid listenCount`,
            };
        }
    }

    return {
        isValid: true,
        items: itemsListenCount.map((i: any) => ({
            songId: i.songId,
            listenCount: i.listenCount,
        })),
    };
}


export const syncListenCounts = async (
    items: ListenCountItem[]
): Promise<boolean> => {
    try {
        for (const item of items) {
            await flowDb
                .update(songsTable)
                .set({
                    listenCount: sql`${songsTable.listenCount} + ${item.listenCount}`,
                })
                .where(
                    sql`${songsTable.songId} = ${item.songId}`
                );
        }

        return true;
    } catch (e) {
        console.error(
            "couldn't sync listen counts: ", 
            e
        );
    }
    return false;
}