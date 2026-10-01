import { SongSearchItem } from "../types/SongSearchItem";

/// request
export type SyncRecencyItem = {
    songId: number;
    recency: number;
}

export type SyncCiSongSearchInput = {
    recencyItems: SyncRecencyItem[];
}

/// response
export type SyncCiSongSearchResponse =
    | {
        success: true;
        itemCount: number;
        cacheItems: SongSearchItem[];
    }
    | {
        success: false;
        debug: object;
    }