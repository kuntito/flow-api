import { inArray, sql, asc, gt, eq } from "drizzle-orm";
import { flowDb } from "../../clients/neonDbClient";
import { ValidationResult } from "../../util/validation";
import { isValidId } from "../helpers";
import { SyncListenHistoryInput, ListenEvent } from "./syncListenHistory.types";
import { validate as isUuid } from "uuid";
import { Transaction } from "../../util/types";
import { songsTable } from "../../schema/song-schema";
import { listenHistoryTable } from "../../schema/listen-history-schema";
import { logDbError } from "../../helpers/dbHelpers";


const isValidListenEvent = (event: any): boolean => {
    const isObject = typeof event === "object" && event !== null;
    if (!isObject) return false;

    const isEventIdValid = typeof event.eventId === "string" && isUuid(event.eventId);
    if (!isEventIdValid) return false;

    const isSongIdValid = isValidId(event.songId);
    if (!isSongIdValid) return false;

    const isListenedAtValid = Number.isInteger(event.listenedAt) && event.listenedAt > 0;
    
    return isListenedAtValid;
}


export const validateInputSyncListenHistory = (
    body: any
): ValidationResult<SyncListenHistoryInput> => {
    const isAfterSeqValid = Number.isInteger(body?.afterSeq) && body.afterSeq >= 0;
    if (!isAfterSeqValid) {
        return {
            isValid: false,
            reason: "afterSeq must be a non-negative integer.",
        };
    }

    const isEventsArray = Array.isArray(body?.events);
    if (!isEventsArray) {
        return {
            isValid: false,
            reason: "events must be an array.",
        };
    }

    const hasInvalidEvent = body.events.some(
        (event: any) => !isValidListenEvent(event)
    );
    if (hasInvalidEvent) {
        return {
            isValid: false,
            reason: "invalid event shape",
        };
    }

    const events: ListenEvent[] = body.events.map((event: any) => ({
        eventId: event.eventId,
        songId: event.songId,
        listenedAt: event.listenedAt,
    }));

    return {
        isValid: true,
        data: {
            events: events,
            afterSeq: body.afterSeq,
        },
    };
}

const listenHistorySyncLockKey = 7301;
const lockListenHistorySync = async (
    tx: Transaction,
) => {
    await tx.execute(
        sql`SELECT pg_advisory_xact_lock(${listenHistorySyncLockKey})`
    );
}

/**
 * the same events, keeping only the ones for songs the server has.
 *
 * events can hold listens for songs the server doesn't have,
 * and those would break the insert.
 *
 * server is truth.
 */
const dropUnknownSongEvents = async (
    tx: Transaction,
    events: ListenEvent[],
): Promise<ListenEvent[]> => {
    if (events.length === 0) {
        return events;
    }

    const sentSongIds = events.map((event) => {
        return event.songId;
    });

    const existingSongRows = await tx
        .select({
            songId: songsTable.songId,
        })
        .from(songsTable)
        .where(
            inArray(
                songsTable.songId,
                sentSongIds,
            )
        );

    const existingSongIds = new Set(
        existingSongRows.map((row) => {
            return row.songId;
        })
    );

    const eventsWithKnownSongs = events.filter((event) => {
        return existingSongIds.has(event.songId);
    });

    return eventsWithKnownSongs;
}


const insertListenEvents = async (
    tx: Transaction,
    events: ListenEvent[],
): Promise<ListenEvent[]> => {
    const eventsWithKnownSongs = await dropUnknownSongEvents(
        tx,
        events,
    );

    if (eventsWithKnownSongs.length === 0) {
        return [];
    }

    const insertedEvents = await tx
        .insert(listenHistoryTable)
        .values(eventsWithKnownSongs)
        .onConflictDoNothing({
            target: listenHistoryTable.eventId,
        })
        .returning({
            eventId: listenHistoryTable.eventId,
            songId: listenHistoryTable.songId,
            listenedAt: listenHistoryTable.listenedAt,
        });

    return insertedEvents;
}


const incrementListenCounts = async (
    tx: Transaction,
    insertedEvents: ListenEvent[],
) => {
    const listenCountBySongId = new Map<number, number>();

    for (const event of insertedEvents) {
        const currentCount = listenCountBySongId.get(event.songId) ?? 0;

        listenCountBySongId.set(
            event.songId,
            currentCount + 1,
        );
    }

    for (const [songId, listenCount] of listenCountBySongId) {
        await tx
            .update(songsTable)
            .set({
                listenCount: sql`${songsTable.listenCount} + ${listenCount}`,
            })
            .where(
                eq(
                    songsTable.songId,
                    songId,
                )
            );
    }
}


type ListenEventsAfter = {
    events: ListenEvent[];
    latestSeq: number;
}

const getListenEventsAfter = async (
    tx: Transaction,
    afterSeq: number,
): Promise<ListenEventsAfter> => {
    const rowsAfter = await tx
        .select({
            seq: listenHistoryTable.seq,
            eventId: listenHistoryTable.eventId,
            songId: listenHistoryTable.songId,
            listenedAt: listenHistoryTable.listenedAt,
        })
        .from(listenHistoryTable)
        .where(
            gt(
                listenHistoryTable.seq,
                afterSeq,
            )
        )
        .orderBy(
            asc(listenHistoryTable.seq)
        );

    const lastRow = rowsAfter[rowsAfter.length - 1];
    const latestSeq = lastRow?.seq ?? afterSeq;

    const events = rowsAfter.map((row) => {
        return {
            eventId: row.eventId,
            songId: row.songId,
            listenedAt: row.listenedAt,
        };
    });

    return {
        events: events,
        latestSeq: latestSeq,
    };
}


export const syncListenEvents = async (
    events: ListenEvent[],
    afterSeq: number,
): Promise<ListenEventsAfter | null> => {
    try {
        return await flowDb.transaction(
            async (tx) => {
                await lockListenHistorySync(tx);

                const insertedEvents = await insertListenEvents(
                    tx,
                    events,
                );

                await incrementListenCounts(
                    tx,
                    insertedEvents,
                );

                const eventsAfter = await getListenEventsAfter(
                    tx,
                    afterSeq,
                );

                return eventsAfter;
            }
        );

    } catch (e) {
        logDbError(
            "couldn't sync listen events",
            e
        );
    }

    return null;
}