/// request
export type SyncPlaylistItem = {
    playlistId: number;
    name: string;
    songIds: number[];
    isAuto: boolean;
}

export type SyncPlaylistsInput = {
    playlists: SyncPlaylistItem[];
}

/// response
export type ResponsePlaylist = {
    playlistId: number;
    name: string;
    songIds: number[];
    isAuto: boolean;
}

export type SyncPlaylistsResponse =
    | {
        success: true;
        playlistCount: number;
        playlists: ResponsePlaylist[];
    }
    | {
        success: false;
        debug: object;
    }