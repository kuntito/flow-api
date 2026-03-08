import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { flowS3Client } from "../clients/flowS3Client";
import { envConfig } from "../envConfig";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { secs } from "./miscHelpers";

export const uploadFileToS3 = async (
    s3Key: string,
    fileBuffer: Buffer,
    mimeType: string
): Promise<boolean> => {
    try {
        await flowS3Client.send(
            new PutObjectCommand({
                Bucket: envConfig.AWS_BUCKET_NAME,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: mimeType,
            })
        );

        return true;
    } catch (e) {
        console.log(
            `s3 file upload failed - s3Key: ${s3Key}, errorMessage: ${
                (e as Error).message
            }`
        );

        return false;
    }
};

/**
 * deletes a file from S3.
 * 
 * returns false if anything goes wrong.
 */
export const deleteFileFromS3 = async (s3Key: string): Promise<boolean> => {
    try {
        await flowS3Client.send(
            new DeleteObjectCommand({
                Bucket: envConfig.AWS_BUCKET_NAME,
                Key: s3Key,
            })
        );

        return true;
    } catch (e) {
        console.log(
            `could not delete from S3, S3Key is `,
            s3Key,
            `error: `,
            (e as Error).message
        );

        return false;
    }
};


/**
 * constructs the public URL for a file in S3.
 *
 * format: `https://<bucket>.s3.<region>.amazonaws.com/<key>`
 * bucket and region come from pre-set config.
 *
 * e.g. "myKey.mp3" → "https://my-bucket.s3.us-east-1.amazonaws.com/myKey.mp3"
 */
export const constructFilePublicUrlS3 = (s3Key: string) => {
    const url = `https://${envConfig.AWS_BUCKET_NAME}.s3.${envConfig.AWS_REGION}.amazonaws.com/${s3Key}`;
    return url;
};

/**
 * returns a presigned url for an S3 object.
 * the url expires after `expiresInSecs` seconds, default is 1 hour.
 */
export const getSignedObjectUrlS3 = async (
    s3Key: string,
    expiresInSecs: number = secs("1h")
): Promise<string> => {
    return getSignedUrl(
        flowS3Client,
        new GetObjectCommand({
            Bucket: envConfig.AWS_BUCKET_NAME,
            Key: s3Key,
        }),
        {
            expiresIn: expiresInSecs
        }
    )
}

/**
 * file urls on s3 are in the format: \
 * "https://my-bucket.s3.us-east-1.amazonaws.com/myKey.mp3"
 *
 * the s3 key is everything after the `.com`.
 * 
 * fn returns the key or a null if something goes wrong.
 */
export const extractS3KeyFromFileUrl = (
    albumArtS3Url: string
): string | null => {
    // this matches everything after the `.com`
    const s3Regex = /\.com\/(.+)/i;
    const match = albumArtS3Url.match(s3Regex);
    return match?.[1] ?? null;
};
