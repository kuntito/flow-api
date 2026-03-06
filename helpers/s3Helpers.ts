import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { flowS3Client } from "../clients/flowS3Client"
import { envConfig } from "../envConfig"


export const uploadFileToS3 = async (
    s3Key: string,
    fileBuffer: Buffer,
    mimeType: string,
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

        return true
    } catch (e) {
        console.log(`s3 file upload failed - s3Key: ${s3Key}, errorMessage: ${(e as Error).message}`);
        
        return false;
    }
}


export const deleteFileFromS3 = async (
    s3Key: string
): Promise<boolean> => {
    try {
        await flowS3Client.send(new DeleteObjectCommand({
            Bucket: envConfig.AWS_BUCKET_NAME,
            Key: s3Key
        }));

        return true;
    } catch(e) {
        console.log(
            `could not delete from S3, S3Key is `,
            s3Key,
            `error: `,
            (e as Error).message
        );

        return false;
    }
}