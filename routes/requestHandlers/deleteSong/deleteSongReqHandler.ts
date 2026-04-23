import { Request, Response, RequestHandler } from "express";
import { logDbError } from "../../../helpers/dbHelpers";
import {
    extractS3KeyFromFileUrl,
    deleteFileFromS3 as safeDeleteFileFromS3,
} from "../../../helpers/s3Helpers";
import {
    safeGetSongFromDb,
} from "../../../helpers/songDbHelpers";
import { SongEntity } from "../../../schema/song-schema";
import { handleDeleteSong } from "./deleteSongHelpers";
import { isSongIdValid } from "../../helpers";

type DeleteSongResponse =
    | {
          success: true;
      }
    | {
          success: false;
          clientErrorMessage?: string;
          debug?: object;
      };


/**
 * deleting a song is in three parts.
 * 
 * - removing the db entry
 * - deleting the song from S3
 * - deleting the album art from S3
 * 
 * the db is the source of truth, if the song doesn't exist there,
 * for all intents and purposes, the song doesn't exist.
 * 
 * as such, this fn prioritizes that.
 * it returns true if the delete from db succeeds, false otherwise.
 * 
 * file deletions from S3 may fail.
 */
const deleteSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<DeleteSongResponse>
) => {
    const { songId } = req.params;

    let songEntity: SongEntity | null = null;
    let isSongDeletedFromDb = false;

    try {
        const isValid = isSongIdValid(songId as string);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                clientErrorMessage: "song id should be a string",
            });
        }

        const songIdasNum = Number(songId);
        songEntity = await safeGetSongFromDb(songIdasNum);

        if (!songEntity) {
            return res.status(404).json({
                success: false,
                debug: {
                    errorMessage: `couldn't find song with songId: ${songId}`,
                },
            });
        }

        isSongDeletedFromDb = await handleDeleteSong(songIdasNum);
        if (!isSongDeletedFromDb) {
            return res.status(500).json({
                success: false,
                clientErrorMessage: `could not delete.`,
            });
        }
    } catch (e) {
        logDbError(`failed to delete, songId: ${songId}`, e);
    }

    if (songEntity != null) {
        await safeDeleteFileFromS3(songEntity.songS3Key);

        const albumArtS3Key = extractS3KeyFromFileUrl(
            songEntity.songAlbumArtUrl
        );
        if (albumArtS3Key != null){ 
            await safeDeleteFileFromS3(albumArtS3Key);
        }
    }

    if (isSongDeletedFromDb) {
        return res.status(200).json({
            success: true,
        });
    } else {
        return res.status(500).json({
            success: false,
            debug: {
                errorMessage: `deleted failed, see songId: ${songId}`,
            },
        });
    }
};

export { deleteSongReqHandler };