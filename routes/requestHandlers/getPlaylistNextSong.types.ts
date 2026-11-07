import { SongWithUrl } from "../types/SongWithUrl";

/// response
export type GetPlaylistNextSongResponse =
    | {
        success: true;
        songWithUrl: SongWithUrl;
    }
    | {
        success: false;
        clientMessage?: string;
        debug?: object;
    }