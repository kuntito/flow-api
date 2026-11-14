import { Request, Response } from "express";
import { SyncPlaylistsResponse } from "./syncPlaylists.types";
import { syncPlaylists, validateInputSyncPlaylists } from "./syncPlaylist.helpers";

export const syncPlaylistsRh = async (
    req: Request,
    res: Response<SyncPlaylistsResponse>
) => {
    const valResSyncPlaylists = validateInputSyncPlaylists(
        req.body.playlists,
    );
    if (!valResSyncPlaylists.isValid) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    reason: valResSyncPlaylists.reason,
                },
            });
    }
    const playlists = await syncPlaylists(

        valResSyncPlaylists.data.playlists,
    );

    if (playlists == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    reason: "failed to sync playlists.",
                },
            });
    }

    return res
        .status(200)
        .json({
            success: true,
            playlistCount: playlists.length,
            playlists: playlists,
        });
}