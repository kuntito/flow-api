import { Request, RequestHandler, Response } from "express";
import { getIdNextSong } from "./getNextSongHelpers";
import { getSignedObjectUrlS3 as getSignedUrlS3 } from "../../../helpers/s3Helpers";
import { safeGetSongFromDb } from "../../../helpers/songDbHelpers";
import { SongEntity } from "../../../schema/song-schema";

export type SongWithUrl = {
    id: number;
    title: string;
    artistStr: string;
    durationMillis: number;
    albumArtUrl: string;
    songUrl: string;
};

const toSongWithUrl = (
    songEntity: SongEntity,
    songUrl: string,
): SongWithUrl => ({
    id: songEntity.songId,
    title: songEntity.songTitle,
    artistStr: songEntity.songArtistName,
    durationMillis: songEntity.songDurationMillis,
    albumArtUrl: songEntity.songAlbumArtUrl,
    songUrl: songUrl,
});

type GetNextSongResponse = {
    success: true;
    songWithUrl: SongWithUrl;
} | {
    success: false;
    debug: object;
}

/**
 * fetches the next song in the queue.
 */
const getNextSong: RequestHandler = async (
    req: Request,
    res: Response<GetNextSongResponse>,
) => {
    const idNextSong = await getIdNextSong();
    if (idNextSong == null) {
        return res.status(500)
            .json({
                success: false,
                debug: {
                    errorMessage: "couldn't get id of next song"
                }
            })
    }

    
    // fetch song from db..
    const songEntity = await safeGetSongFromDb(idNextSong);
    if (songEntity == null) {
        return res
            .status(500)
            .json({
                success: false,
                debug: {
                    message: "couldn't fetch song from db"
                }
            })
    }
    
    const songUrl = await getSignedUrlS3(songEntity.songS3Key);

    const songWithUrl: SongWithUrl = toSongWithUrl(
        songEntity,
        songUrl,
    );

    return res
        .status(200)
        .json({
            success: true,
            songWithUrl: songWithUrl,
        });
}

export { getNextSong };