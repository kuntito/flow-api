/// request
export type ListenEvent = {
    eventId: string;
    songId: number;
    listenedAt: number;
}

export type SyncListenHistoryInput = {
    events: ListenEvent[];
    afterSeq: number;
}

/// response
export type SyncListenHistoryResponse =
    | {
        success: true;
        latestSeq: number;
        itemCount: number;
        events: ListenEvent[];
    }
    | {
        success: false;
        debug: object;
    }