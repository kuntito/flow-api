import { Request, Response } from "express";
import { GetPlaylistNextSongResponse } from "./getPlaylistNextSong.types";
import { getLeastRecentPlaylistSong, validatePlaylistId } from "./getPlaylistNextSong.helpers";
import { SongWithUrl } from "../types/SongWithUrl";
import { prepareSongForClient } from "../../helpers/miscHelpers";

export const getPlaylistNextSongRh = async (
    req: Request,
    res: Response<GetPlaylistNextSongResponse>
) => {
    const valResPlaylistId = validatePlaylistId(
        req.params.playlistIdStr,
    );
    if (!valResPlaylistId.isValid) {
        return res
            .status(400)
            .json({
                success: false,
                debug: {
                    reason: valResPlaylistId.reason,
                },
            });
    }

    const songEntity = await getLeastRecentPlaylistSong(
        valResPlaylistId.data,
    );

    if (songEntity == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    reason: "couldn't get the next song from this playlist.",
                },
            });
    }

    const songWithUrl: SongWithUrl = await prepareSongForClient(songEntity);

    return res
        .status(200)
        .json({
            success: true,
            songWithUrl: songWithUrl,
        });
}