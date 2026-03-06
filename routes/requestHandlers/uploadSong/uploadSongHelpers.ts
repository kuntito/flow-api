import { parseBuffer } from "music-metadata";
import fs from "fs";
import path from "path";
import { s3AlbumArtPrefix, s3SongPrefix } from "../../../util/constants";
import { randomUUID } from "crypto";
import {
    constructFilePublicUrlS3,
    uploadFileToS3,
} from "../../../helpers/s3Helpers";
import { SongInsertEntity, songsTable } from "../../../schema/song-schema";
import { flowDb } from "../../../clients/neonDbClient";

type AlbumArtFromFile = {
    buffer: Buffer;
    mimeType: string;
    ext: string;
};

type SongMdFromFile = {
    title: string | null;
    artistStr: string | null;
    albumArtFromFile: AlbumArtFromFile | null;
    durationMillis: number | null;
};

/**
 * reads a song file and extracts its metadata.
 *
 * returns:
 *  - title
 *  - artist string i.e. "Rita Ora" or "Rita Ora (feat. 6LACK)"
 *  - album art info
 *  - duration in milliseconds
 *
 * all fields are nullable since song could have missing metadata.
 *
 * @param songFileBuffer - the song file as a buffer
 * @param ext - song file extension
 */
export const getSongMdFromFile = async (
    songFileBuffer: Buffer,
    ext: string
): Promise<SongMdFromFile> => {
    const songMd = await parseBuffer(songFileBuffer);

    const title = songMd.common.title ?? null;
    const artistStr = songMd.common.artist ?? null;

    const albumArtInfo = songMd.common.picture?.[0];
    const albumArtFromFile = albumArtInfo
        ? {
              buffer: Buffer.from(albumArtInfo.data),
              mimeType: albumArtInfo.format,
              ext: getExtensionFromMimeType(albumArtInfo.format) ?? "jpg",
          }
        : null;

    const durationMillis = songMd.format.duration
        ? Math.round(songMd.format.duration * 1000)
        : null;

    return {
        title,
        artistStr,
        albumArtFromFile,
        durationMillis,
    };
};

/**
 * extracts the file extension from a MIME type string.
 *
 * MIME types follow the format: `type/subtype[; parameters]`
 * the subtype is usually the file extension.
 * some times there's extra information, it's denoted by a semicolon.
 *
 * examples are:
 * - "image/jpeg"
 * - "audio/mpeg; charset=utf-8"
 *
 * @param mimeType
 * @returns the file extension i.e. "jpeg" or null
 */
const getExtensionFromMimeType = (mimeType: string): string | null => {
    if (!mimeType) return null;

    const charsAfterFwdSlash = mimeType.split("/")[1];
    if (!charsAfterFwdSlash) return null;

    const extension = charsAfterFwdSlash.split(";")[0] || null;
    return extension;
};

export type AlbumArtS3UploadResult = {
    aaUrl: string;
    aaS3Key: string;
};

/**
 * uploads album art to S3.
 *
 * if successful, returns the url and S3 key.
 * otherwise, null.
 *
 * e.g. { url: "https://bucket.s3.amazonaws.com/album-art/550e8400.jpeg", s3Key: "album-art/550e8400.jpeg" }
 */
export const uploadAlbumArtToS3 = async (
    aaFromFile: AlbumArtFromFile | null
): Promise<AlbumArtS3UploadResult | null> => {
    if (aaFromFile == null) return null;

    const s3Key = getAlbumArtS3Key(aaFromFile.ext);

    const isUploadSuccess = await uploadFileToS3(
        s3Key,
        aaFromFile.buffer,
        aaFromFile.mimeType
    );

    if (isUploadSuccess)
        return {
            aaUrl: constructFilePublicUrlS3(s3Key),
            aaS3Key: s3Key,
        };

    return null;
};

/**
 * generates a unique S3 key for an album art file.
 *
 * uses UUID to ensure uniqueness and prepends the album art directory, `s3AlbumArtPrefix`.
 *
 * e.g. "album-art/550e8400-e29b-41d4-a716-446655440000.jpeg"
 */
const getAlbumArtS3Key = (fileExt: string): string => {
    const uuid = randomUUID();
    const fileName = uuid + "." + fileExt;
    const s3Key = s3AlbumArtPrefix + fileName;
    return s3Key;
};

/**
 * uploads song file to S3.
 *
 * returns the S3 key if successful, otherwise null.
 */
export const uploadSongToS3 = async (
    songBuffer: Buffer,
    fileStem: string,
    fileExt: string,
    mimeType: string
) => {
    const s3Key = getSongS3Key(fileStem, fileExt);

    const isUploadSuccess = await uploadFileToS3(s3Key, songBuffer, mimeType);

    return isUploadSuccess ? s3Key : null;
};

/**
 * generates a unique S3 key for a song file.
 *
 * uses UUID to ensure uniqueness and prepends the songs directory, `s3SongPrefix`
 *
 * e.g. "tracks/can't breathe-550e8400-e29b-41d4-a716-446655440000.mp3"
 */
const getSongS3Key = (fileStem: string, fileExt: string) => {
    const uuid = randomUUID();
    const fileName = fileStem + "-" + uuid + "." + fileExt;
    const s3Key = s3SongPrefix + fileName;
    return s3Key;
};

/**
 * pulls the file extension, stem, and mime type from a multer file.
 *
 * e.g. "Again.mp3"
 *
 *  - ext: ".mp3",
 *  - stem: "Again",
 *  - mimeType: "audio/mpeg"
 */
export const getSongFileInfo = (songFile: Express.Multer.File) => {
    const songFileExt = path.extname(songFile.originalname);
    const songFileStem = path.basename(songFile.originalname, songFileExt);
    const songFileMimeType = songFile.mimetype;

    return { songFileExt, songFileStem, songFileMimeType };
};

export const insertSongInDb = async (
    songEntity: SongInsertEntity
): Promise<boolean> => {
    try {
        await flowDb.insert(songsTable).values(songEntity);
        return true;
    } catch (e) {
        console.log(
            `db insert failed, songsTable, errorMessage: ${
                (e as Error).message
            }`
        );

        return false;
    }
};

export const deleteUploadedFile = async (fp: string) => {
    try {
        await fs.promises.unlink(fp);
    } catch(e) {
        console.log(`failed to delete ${fp}`);
    }
};
