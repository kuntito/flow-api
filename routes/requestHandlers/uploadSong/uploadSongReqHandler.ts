import { RequestHandler, Request, Response } from "express";
import fs from "fs";
import {
    getSongFileInfo,
    getSongMdFromFile,
    uploadAlbumArtToS3,
    uploadSongToS3,
    insertSongInDb,
    deleteUploadedFile,
} from "./uploadSongHelpers";
import { albumArtPlaceholderUrl } from "../../../util/constants";
import { SongInsertEntity } from "../../../schema/song-schema";
import { deleteFileFromS3 } from "../../../helpers/s3Helpers";

type UploadSongResponse =
    | {
          success: true;
          songFileName: string;
      }
    | {
          success: false;
          clientErrorMessage?: string;
          debug?: object;
      };

/**
 * uploads song to storage.
 * 
 * `multer` downloads the uploaded file so i can determine the file extension.
 * the content type from the POST request may not have it.
 * 
 * the audio is uploaded to S3.
 * 
 * if upload is successful, two things happen.
 * the album art is uploaded to S3, and
 * the song details are inserted into the db.
 * 
 * if album art is missing, a placeholder image url is used.
 * if db insert fails, both song file and album art are removed from S3.
 * 
 * the multer download file is cleaned up at the end.
 */
const uploadSongReqHandler: RequestHandler = async (
    req: Request,
    res: Response<UploadSongResponse>
) => {
    // TODO consider using the buffer directly from POST request,
    // doing this would mean file extension would be sourced elsewhere.

    // `multer` handles the file download, it should be set up `flowRoutes`.
    const uploadedSongFile = req.file;

    if (!uploadedSongFile) {
        return res.status(400).json({
            success: false,
            clientErrorMessage: "no song uploaded",
        });
    }

    const uploadedSongFp = uploadedSongFile.path;

    try {
        const { songFileExt, songFileStem, songFileMimeType } =
            getSongFileInfo(uploadedSongFile);
    
        const isMp3 = songFileExt.toLowerCase() === ".mp3";
        if (!isMp3) {
            return res.status(400).json({
                success: false,
                clientErrorMessage: "only mp3 allowed",
            });
        }
    
        const songFileBuffer = await fs.promises.readFile(uploadedSongFp);
    
    
        const songS3Key = await uploadSongToS3(
            songFileBuffer,
            songFileStem,
            songFileExt,
            songFileMimeType,
        );

        const songFileName = `${songFileStem}${songFileExt}`
        if (!songS3Key) {
            return res
                .status(500)
                .json({
                    success: false,
                    clientErrorMessage: "error occurred",
                    debug: {
                        errorMessage: `s3 upload failed for ${songFileName}`
                    }
                });
        }
    
        const songMdFromFile = await getSongMdFromFile(songFileBuffer, songFileExt);
    
        const aaFromFile = songMdFromFile.albumArtFromFile;
        const aaUploadRes = await uploadAlbumArtToS3(aaFromFile);
        const aaUrl = aaUploadRes ? aaUploadRes.aaUrl : albumArtPlaceholderUrl;
    
        const songEntity: SongInsertEntity = {
            songS3Key: songS3Key,
            songTitle: songMdFromFile.title ?? "...",
            songArtistName: songMdFromFile.artistStr ?? "...",
            songAlbumArtUrl: aaUrl,
            // TODO duration should never be nullable if file is audio
            songDurationMillis: songMdFromFile.durationMillis ?? 0,
        }
    
        const isSongInsertedToDb = await insertSongInDb(songEntity);
        if (!isSongInsertedToDb) {
            await deleteFileFromS3(songS3Key);
    
            if (aaUploadRes) {
                await deleteFileFromS3(aaUploadRes.aaS3Key);
            }

            return res
                .status(500)
                .json({
                    success: false,
                    clientErrorMessage: "error occurred",
                    debug: {
                        errorMessage: "db insert for upload song fails"
                    }
                })
        }
        return res
            .status(201)
            .json({
                success: true,
                songFileName: `${songFileName}`
            });
    } finally {
        await deleteUploadedFile(uploadedSongFp);
    }
};

export { uploadSongReqHandler };