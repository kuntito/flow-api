import { sql } from "drizzle-orm";
import { flowDb } from "../../clients/neonDbClient";
import { ValidationResult } from "../../util/validation";
import { SyncCiSongSearchInput, SyncRecencyItem } from "./syncSongSearchCache.types";
import { songsTable } from "../../schema/song-schema";
import { logDbError } from "../../helpers/dbHelpers";

export const validateInputSyncSongCache = (
    recencyItems: any
): ValidationResult<SyncCiSongSearchInput> => {
    if (!Array.isArray(recencyItems)) {
        return {
            isValid: false,
            reason: "recency items must be a list",
        };
    }

    const now = Date.now();

    for (
        let itemIndex = 0;
        itemIndex < recencyItems.length;
        itemIndex++
    ) {
        const item = recencyItems[itemIndex];
        const itemNumber = itemIndex + 1;

        if (!Number.isInteger(item?.songId)) {
            return {
                isValid: false,
                reason: `item ${itemNumber}: song id is missing or not a whole number`,
            };
        }

        if (!Number.isInteger(item.recency) || item.recency <= 0) {
            return {
                isValid: false,
                reason: `item ${itemNumber}, song ${item.songId}: recency is missing or not a positive whole number`,
            };
        }

        if (item.recency > now) {
            return {
                isValid: false,
                reason: `item ${itemNumber}, song ${item.songId}: recency is in the future`,
            };
        }
    }

    const validatedItems: SyncRecencyItem[] = recencyItems.map((item) => {
        return {
            songId: item.songId,
            recency: item.recency,
        };
    });

    return {
        isValid: true,
        data: {
            recencyItems: validatedItems,
        },
    };
}


export const applyRecencies = async (
    recencyItems: SyncRecencyItem[]
): Promise<boolean> => {
    if (recencyItems.length === 0) {
        return true;
    }

    const songIds = recencyItems.map((item) => {
        return item.songId;
    });

    const recencies = recencyItems.map((item) => {
        return item.recency;
    });

    const songIdsLiteral = `{${songIds.join(",")}}`;
    const recenciesLiteral = `{${recencies.join(",")}}`;

    const recencyColumnName = sql.identifier(songsTable.recency.name);

    try {
        await flowDb.execute(sql`
            UPDATE ${songsTable}
            SET ${recencyColumnName} = GREATEST(
                ${songsTable.recency},
                incoming.recency
            )
            FROM unnest(
                ${songIdsLiteral}::int[],
                ${recenciesLiteral}::bigint[]
            ) AS incoming(
                song_id,
                recency
            )
            WHERE ${songsTable.songId} = incoming.song_id
        `);

        return true;
    } catch (e) {
        logDbError(
            "couldn't apply recencies",
            e
        );
    }

    return false;
}