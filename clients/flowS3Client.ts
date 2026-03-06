import { S3Client } from "@aws-sdk/client-s3";
import { envConfig } from "../envConfig";

const { 
    AWS_REGION, 
    AWS_ACCESS_KEY, 
    AWS_SECRET_ACCESS_KEY 
} = envConfig;

const flowS3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});

export { flowS3Client };